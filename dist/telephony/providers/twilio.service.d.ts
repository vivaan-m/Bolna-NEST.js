import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CallOptions } from '../telephony.service';
export declare class TwilioService {
    private readonly configService;
    private readonly logger;
    private readonly accountSid?;
    private readonly authToken?;
    private readonly phoneNumber?;
    constructor(configService: ConfigService);
    initiateCall(options: CallOptions): Promise<string>;
    endCall(callId: string): Promise<boolean>;
    handleWebhook(req: Request, res: Response): Promise<void>;
}
