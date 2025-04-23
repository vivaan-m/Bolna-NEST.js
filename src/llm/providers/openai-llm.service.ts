import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LlmOptions, LlmResponse, Message } from '../llm.service';

@Injectable()
export class OpenAiLlmService {
  private readonly logger = new Logger(OpenAiLlmService.name);
  private readonly apiKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY is not set. OpenAI LLM will not work properly.');
    }
  }

  async generateResponse(messages: Message[], options: LlmOptions): Promise<LlmResponse> {
    try {
      const model = options.model || 'gpt-3.5-turbo';
      const temperature = options.temperature || 0.7;
      const maxTokens = options.maxTokens || 150;
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const result = response.data;
      
      return {
        text: result.choices[0].message.content,
        usage: {
          promptTokens: result.usage.prompt_tokens,
          completionTokens: result.usage.completion_tokens,
          totalTokens: result.usage.total_tokens,
        },
      };
    } catch (error) {
      this.logger.error(`Error generating response with OpenAI: ${error.message}`);
      throw error;
    }
  }

  async streamResponse(messages: Message[], options: LlmOptions, onChunk: (chunk: string) => void): Promise<LlmResponse> {
    try {
      const model = options.model || 'gpt-3.5-turbo';
      const temperature = options.temperature || 0.7;
      const maxTokens = options.maxTokens || 150;
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        }
      );
      
      let fullText = '';
      
      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.includes('[DONE]')) continue;
          
          try {
            const parsedLine = JSON.parse(line.replace(/^data: /, ''));
            const content = parsedLine.choices[0]?.delta?.content || '';
            
            if (content) {
              fullText += content;
              onChunk(content);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      });
      
      return new Promise((resolve) => {
        response.data.on('end', () => {
          resolve({
            text: fullText,
            // Usage information is not available in streaming responses
          });
        });
      });
    } catch (error) {
      this.logger.error(`Error streaming response with OpenAI: ${error.message}`);
      throw error;
    }
  }
}