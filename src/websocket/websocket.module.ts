import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { AgentModule } from '../agent/agent.module';
import { AsrModule } from '../asr/asr.module';
import { LlmModule } from '../llm/llm.module';
import { TtsModule } from '../tts/tts.module';

@Module({
  imports: [AgentModule, AsrModule, LlmModule, TtsModule],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}