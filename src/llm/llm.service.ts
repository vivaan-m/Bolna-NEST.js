import { Injectable, Logger } from '@nestjs/common';
import { OpenAiLlmService } from './providers/openai-llm.service';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmOptions {
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  options?: any;
}

export interface LlmResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly openAiLlmService: OpenAiLlmService) {}

  async generateResponse(messages: Message[], options: LlmOptions): Promise<LlmResponse> {
    this.logger.debug(`Generating response with provider: ${options.provider}, model: ${options.model}`);
    
    switch (options.provider.toLowerCase()) {
      case 'openai':
        return this.openAiLlmService.generateResponse(messages, options);
      default:
        throw new Error(`Unsupported LLM provider: ${options.provider}`);
    }
  }

  async streamResponse(messages: Message[], options: LlmOptions, onChunk: (chunk: string) => void): Promise<LlmResponse> {
    this.logger.debug(`Streaming response with provider: ${options.provider}, model: ${options.model}`);
    
    switch (options.provider.toLowerCase()) {
      case 'openai':
        return this.openAiLlmService.streamResponse(messages, options, onChunk);
      default:
        throw new Error(`Unsupported LLM provider: ${options.provider}`);
    }
  }
}