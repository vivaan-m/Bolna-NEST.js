import { Module, forwardRef } from '@nestjs/common';
import { TaskService } from './task.service';
import { LlmModule } from '../../llm/llm.module';

@Module({
  imports: [
    forwardRef(() => LlmModule), // Use forwardRef to avoid circular dependency
  ],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}