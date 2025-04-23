import { Injectable, Logger } from '@nestjs/common';
import { AwsPollyTtsService } from './providers/aws-polly-tts.service';
import { ElevenLabsTtsService } from './providers/elevenlabs-tts.service';

export interface TtsOptions {
  provider: string;
  voice?: string;
  language?: string;
  options?: any;
}

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);

  constructor(
    private readonly awsPollyTtsService: AwsPollyTtsService,
    private readonly elevenLabsTtsService: ElevenLabsTtsService,
  ) {}

  async synthesize(text: string, options: TtsOptions): Promise<Buffer> {
    this.logger.debug(`Synthesizing speech with provider: ${options.provider}`);
    
    switch (options.provider.toLowerCase()) {
      case 'aws':
      case 'polly':
      case 'aws-polly':
        return this.awsPollyTtsService.synthesize(text, options);
      case 'elevenlabs':
        return this.elevenLabsTtsService.synthesize(text, options);
      default:
        throw new Error(`Unsupported TTS provider: ${options.provider}`);
    }
  }

  async streamSynthesize(text: string, options: TtsOptions, onChunk: (chunk: Buffer) => void): Promise<void> {
    this.logger.debug(`Streaming speech synthesis with provider: ${options.provider}`);
    
    switch (options.provider.toLowerCase()) {
      case 'aws':
      case 'polly':
      case 'aws-polly':
        return this.awsPollyTtsService.streamSynthesize(text, options, onChunk);
      case 'elevenlabs':
        return this.elevenLabsTtsService.streamSynthesize(text, options, onChunk);
      default:
        throw new Error(`Unsupported TTS provider: ${options.provider}`);
    }
  }
}