import { ConfigService } from '@nestjs/config';
import { TtsOptions } from '../tts.service';
export declare class ElevenLabsTtsService {
    private readonly configService;
    private readonly logger;
    private readonly apiKey?;
    constructor(configService: ConfigService);
    synthesize(text: string, options: TtsOptions): Promise<Buffer>;
    streamSynthesize(text: string, options: TtsOptions, onChunk: (chunk: Buffer) => void): Promise<void>;
}
