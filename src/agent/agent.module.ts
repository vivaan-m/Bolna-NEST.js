import { Module, forwardRef } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { RedisModule } from '../redis/redis.module';
import { LlmModule } from '../llm/llm.module';
import { MemoryModule } from './memory/memory.module';
import { TaskModule } from './tasks/task.module';
import { AgentManagerModule } from './manager/agent-manager.module';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => LlmModule), // Use forwardRef to avoid circular dependency
    MemoryModule,
    TaskModule,
    forwardRef(() => AgentManagerModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}