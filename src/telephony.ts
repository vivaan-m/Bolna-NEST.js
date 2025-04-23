import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelephonyModule } from './telephony/telephony.module';
import { RedisModule } from './redis/redis.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AgentModule } from './agent/agent.module';
import { AsrModule } from './asr/asr.module';
import { LlmModule } from './llm/llm.module';
import { TtsModule } from './tts/tts.module';

// Create a standalone module for the telephony server
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule,
    WebsocketModule,
    AgentModule,
    AsrModule,
    LlmModule,
    TtsModule,
    TelephonyModule,
  ],
})
class TelephonyServerModule {}

async function bootstrap() {
  const logger = new Logger('TelephonyBootstrap');
  const app = await NestFactory.create(TelephonyServerModule);
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());
  
  // Enable CORS
  app.enableCors();
  
  // Get port from environment variable or use default
  const port = process.env.PORT || 3001;
  
  // Start the server
  await app.listen(port);
  
  logger.log(`Telephony server is running on: http://localhost:${port}`);
  logger.log('Telephony server is ready to handle calls');
}

bootstrap();