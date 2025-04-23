import { RedisService } from '../../redis/redis.service';
import { Message } from '../../llm/llm.service';
import { MemoryConfig } from '../agent.service';
export declare class MemoryService {
    private readonly redisService;
    private readonly logger;
    private readonly memoryDir;
    constructor(redisService: RedisService);
    addMessage(agentId: string, message: Message, config: MemoryConfig): Promise<void>;
    getMessages(agentId: string, config: MemoryConfig): Promise<Message[]>;
    clearMemory(agentId: string, config: MemoryConfig): Promise<void>;
    private addToShortTermMemory;
    private getShortTermMemory;
    private clearShortTermMemory;
    private addToLongTermMemory;
    private getLongTermMemory;
    private clearLongTermMemory;
    private getMessageId;
}
