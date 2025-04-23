import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class AsrService {
  private readonly logger = new Logger(AsrService.name);

  constructor(private readonly deepgramAsrService: DeepgramAsrService) {}

  async transcribe(audioData: Buffer, options: AsrOptions): Promise<AsrResult> {
    this.logger.debug(`Transcribing audio with provider: ${options.provider}`);
    
    switch (options.provider.toLowerCase()) {
      case 'deepgram':
        return this.deepgramAsrService.transcribe(audioData, options);
      default:
        throw new Error(`Unsupported ASR provider: ${options.provider}`);
    }
  }

  createStreamingSession(options: AsrOptions): any {
    this.logger.debug(`Creating streaming session with provider: ${options.provider}`);
    
    switch (options.provider.toLowerCase()) {
      case 'deepgram':
        return this.deepgramAsrService.createStreamingSession(options);
      default:
        throw new Error(`Unsupported ASR provider: ${options.provider}`);
    }
  }
}