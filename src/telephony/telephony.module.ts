import { Module } from '@nestjs/common';
import { TelephonyService } from './telephony.service';
import { TelephonyController } from './telephony.controller';
import { TwilioService } from './providers/twilio.service';
import { PlivoService } from './providers/plivo.service';
import { AgentModule } from '../agent/agent.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [AgentModule, WebsocketModule],
  controllers: [TelephonyController],
  providers: [TelephonyService, TwilioService, PlivoService],
  exports: [TelephonyService],
})
export class TelephonyModule {}