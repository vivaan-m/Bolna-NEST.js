import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TtsOptions } from '../tts.service';

@Injectable()
export class ElevenLabsTtsService {
  private readonly logger = new Logger(ElevenLabsTtsService.name);
  private readonly apiKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ELEVENLABS_API_KEY');
    
    if (!this.apiKey) {
      this.logger.warn('ELEVENLABS_API_KEY is not set. ElevenLabs TTS will not work properly.');
    }
  }

  async synthesize(text: string, options: TtsOptions): Promise<Buffer> {
    try {
      const voice = options.voice || 'Adam';
      
      this.logger.debug(`Synthesizing speech with ElevenLabs: ${text.substring(0, 50)}...`);
      
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          responseType: 'arraybuffer',
        }
      );
      
      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`Error synthesizing speech with ElevenLabs: ${error.message}`);
      throw error;
    }
  }

  async streamSynthesize(text: string, options: TtsOptions, onChunk: (chunk: Buffer) => void): Promise<void> {
    try {
      const voice = options.voice || 'Adam';
      
      this.logger.debug(`Streaming speech synthesis with ElevenLabs: ${text.substring(0, 50)}...`);
      
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`,
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          responseType: 'stream',
        }
      );
      
      response.data.on('data', (chunk: Buffer) => {
        onChunk(chunk);
      });
      
      return new Promise((resolve, reject) => {
        response.data.on('end', resolve);
        response.data.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`Error streaming speech synthesis with ElevenLabs: ${error.message}`);
      throw error;
    }
  }
}