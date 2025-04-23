import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AsrResult } from '../asr.service';

@Injectable()
export class DeepgramAsrService {
  private readonly logger = new Logger(DeepgramAsrService.name);
  private readonly apiKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPGRAM_AUTH_TOKEN');
    
    if (!this.apiKey) {
      this.logger.warn('DEEPGRAM_AUTH_TOKEN is not set. Deepgram ASR will not work properly.');
    }
  }

  async transcribe(audioData: Buffer, options: any): Promise<AsrResult> {
    try {
      const model = options.model || 'nova-2';
      const language = options.language || 'en';
      
      const response = await axios.post(
        'https://api.deepgram.com/v1/listen',
        audioData,
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'audio/raw',
          },
          params: {
            model,
            language,
            encoding: 'linear16',
            sample_rate: 16000,
          },
        }
      );
      
      const result = response.data;
      const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';
      const confidence = result.results?.channels[0]?.alternatives[0]?.confidence || 0;
      
      return {
        text: transcript,
        confidence,
        isFinal: true,
      };
    } catch (error) {
      this.logger.error(`Error transcribing with Deepgram: ${error.message}`);
      throw error;
    }
  }

  createStreamingSession(options: any): any {
    // In a real implementation, this would create a WebSocket connection to Deepgram
    // For simplicity, we're returning a mock object
    return {
      send: (data: Buffer) => {
        this.logger.debug('Sending audio data to Deepgram streaming session');
      },
      close: () => {
        this.logger.debug('Closing Deepgram streaming session');
      },
      onTranscript: (callback: (result: AsrResult) => void) => {
        this.logger.debug('Registered transcript callback for Deepgram streaming session');
      },
    };
  }
}