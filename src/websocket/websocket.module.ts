import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { AgentModule } from '../agent/agent.module';
import { AgentManagerModule } from '../agent/manager/agent-manager.module';

@Module({
  imports: [
    AgentModule,
    AgentManagerModule,
  ],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}