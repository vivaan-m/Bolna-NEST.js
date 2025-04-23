import { DeepgramAsrService } from './providers/deepgram-asr.service';
export interface AsrResult {
    text: string;
    confidence: number;
    isFinal: boolean;
}
export interface AsrOptions {
    provider: string;
    model?: string;
    language?: string;
    options?: any;
}
export declare class AsrService {
    private readonly deepgramAsrService;
    private readonly logger;
    constructor(deepgramAsrService: DeepgramAsrService);
    transcribe(audioData: Buffer, options: AsrOptions): Promise<AsrResult>;
    createStreamingSession(options: AsrOptions): any;
}
