import { Injectable, Logger } from '@nestjs/common';
import { TwilioService } from './providers/twilio.service';
import { PlivoService } from './providers/plivo.service';

export interface CallOptions {
  provider: string;
  to: string;
  from: string;
  agentId: string;
  options?: any;
}

@Injectable()
export class TelephonyService {
  private readonly logger = new Logger(TelephonyService.name);

  constructor(
    private readonly twilioService: TwilioService,
    private readonly plivoService: PlivoService,
  ) {}

  async initiateCall(options: CallOptions): Promise<string> {
    this.logger.debug(`Initiating call with provider: ${options.provider}`);
    
    switch (options.provider.toLowerCase()) {
      case 'twilio':
        return this.twilioService.initiateCall(options);
      case 'plivo':
        return this.plivoService.initiateCall(options);
      default:
        throw new Error(`Unsupported telephony provider: ${options.provider}`);
    }
  }

  async endCall(callId: string, provider: string): Promise<boolean> {
    this.logger.debug(`Ending call ${callId} with provider: ${provider}`);
    
    switch (provider.toLowerCase()) {
      case 'twilio':
        return this.twilioService.endCall(callId);
      case 'plivo':
        return this.plivoService.endCall(callId);
      default:
        throw new Error(`Unsupported telephony provider: ${provider}`);
    }
  }

  getWebhookUrl(provider: string): string {
    switch (provider.toLowerCase()) {
      case 'twilio':
        return '/telephony/twilio/webhook';
      case 'plivo':
        return '/telephony/plivo/webhook';
      default:
        throw new Error(`Unsupported telephony provider: ${provider}`);
    }
  }
}