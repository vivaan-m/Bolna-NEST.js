import { TwilioService } from './providers/twilio.service';
import { PlivoService } from './providers/plivo.service';
export interface CallOptions {
    provider: string;
    to: string;
    from: string;
    agentId: string;
    options?: any;
}
export declare class TelephonyService {
    private readonly twilioService;
    private readonly plivoService;
    private readonly logger;
    constructor(twilioService: TwilioService, plivoService: PlivoService);
    initiateCall(options: CallOptions): Promise<string>;
    endCall(callId: string, provider: string): Promise<boolean>;
    getWebhookUrl(provider: string): string;
}
