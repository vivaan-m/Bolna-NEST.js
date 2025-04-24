import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const appType = configService.get<string>('APP_TYPE', 'api');
  
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Bolna API')
    .setDescription('The Bolna API documentation')
    .setVersion('1.0')
    .addTag('agents', 'Agent management endpoints')
    .addTag('telephony', 'Telephony integration endpoints')
    .addTag('websocket', 'WebSocket communication endpoints')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(port);
  
  if (appType === 'api') {
    logger.log(`API server is running on: http://localhost:${port}`);
    logger.log(`Socket.IO server is available at: http://localhost:${port}/chat/v1`);
  } else {
    logger.log(`Application is running on: http://localhost:${port}`);
  }
}

// Only bootstrap if this is not the telephony server
if (process.env.APP_TYPE !== 'telephony') {
  bootstrap();
}
