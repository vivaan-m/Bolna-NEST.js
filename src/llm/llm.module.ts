import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { OpenAiLlmService } from './providers/openai-llm.service';

@Module({
  providers: [LlmService, OpenAiLlmService],
  exports: [LlmService],
})
export class LlmModule {}