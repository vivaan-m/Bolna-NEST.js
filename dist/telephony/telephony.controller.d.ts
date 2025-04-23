import { TelephonyService, CallOptions } from './telephony.service';
import { Request, Response } from 'express';
import { TwilioService } from './providers/twilio.service';
import { PlivoService } from './providers/plivo.service';
export declare class TelephonyController {
    private readonly telephonyService;
    private readonly twilioService;
    private readonly plivoService;
    constructor(telephonyService: TelephonyService, twilioService: TwilioService, plivoService: PlivoService);
    initiateCall(options: CallOptions): Promise<{
        callId: string;
    }>;
    endCall(callId: string, provider: string): Promise<{
        success: boolean;
    }>;
    twilioWebhook(req: Request, res: Response): Promise<void>;
    plivoWebhook(req: Request, res: Response): Promise<void>;
    getWebhookUrl(provider: string): {
        url: string;
    };
}
