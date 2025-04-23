import { ConfigService } from '@nestjs/config';
import { AsrResult } from '../asr.service';
export declare class DeepgramAsrService {
    private readonly configService;
    private readonly logger;
    private readonly apiKey?;
    constructor(configService: ConfigService);
    transcribe(audioData: Buffer, options: any): Promise<AsrResult>;
    createStreamingSession(options: any): any;
}
