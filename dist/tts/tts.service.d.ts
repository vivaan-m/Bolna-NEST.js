import { AwsPollyTtsService } from './providers/aws-polly-tts.service';
import { ElevenLabsTtsService } from './providers/elevenlabs-tts.service';
export interface TtsOptions {
    provider: string;
    voice?: string;
    language?: string;
    options?: any;
}
export declare class TtsService {
    private readonly awsPollyTtsService;
    private readonly elevenLabsTtsService;
    private readonly logger;
    constructor(awsPollyTtsService: AwsPollyTtsService, elevenLabsTtsService: ElevenLabsTtsService);
    synthesize(text: string, options: TtsOptions): Promise<Buffer>;
    streamSynthesize(text: string, options: TtsOptions, onChunk: (chunk: Buffer) => void): Promise<void>;
}
