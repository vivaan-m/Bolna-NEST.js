import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const appType = configService.get<string>('APP_TYPE', 'api');
  
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  await app.listen(port);
  
  if (appType === 'api') {
    logger.log(`API server is running on: http://localhost:${port}`);
  } else {
    logger.log(`Application is running on: http://localhost:${port}`);
  }
}

// Only bootstrap if this is not the telephony server
if (process.env.APP_TYPE !== 'telephony') {
  bootstrap();
}
