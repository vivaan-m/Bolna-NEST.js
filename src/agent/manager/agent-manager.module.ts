import { Module, forwardRef } from '@nestjs/common';
import { AgentManagerService } from './agent-manager.service';
import { AgentModule } from '../agent.module';
import { MemoryModule } from '../memory/memory.module';
import { TaskModule } from '../task.module';
import { LlmModule } from '../../llm/llm.module';
import { AsrModule } from '../../asr/asr.module';
import { TtsModule } from '../../tts/tts.module';

@Module({
  imports: [
    forwardRef(() => AgentModule), // Use forwardRef to avoid circular dependency
    MemoryModule,
    TaskModule,
    LlmModule,
    AsrModule,
    TtsModule,
  ],
  providers: [AgentManagerService],
  exports: [AgentManagerService],
})
export class AgentManagerModule {}