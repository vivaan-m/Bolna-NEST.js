import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agent/agent.module';
import { TelephonyModule } from './telephony/telephony.module';
import { AsrModule } from './asr/asr.module';
import { LlmModule } from './llm/llm.module';
import { TtsModule } from './tts/tts.module';
import { WebsocketModule } from './websocket/websocket.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AgentModule,
    TelephonyModule,
    AsrModule,
    LlmModule,
    TtsModule,
    WebsocketModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
