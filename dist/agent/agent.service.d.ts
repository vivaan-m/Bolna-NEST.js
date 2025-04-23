import { RedisService } from '../redis/redis.service';
export interface AgentConfig {
    name: string;
    description?: string;
    asr: {
        provider: string;
        model?: string;
        options?: any;
    };
    llm: {
        provider: string;
        model: string;
        options?: any;
        systemPrompt?: string;
    };
    tts: {
        provider: string;
        voice?: string;
        options?: any;
    };
}
export interface Agent {
    id: string;
    config: AgentConfig;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AgentService {
    private readonly redisService;
    private readonly logger;
    constructor(redisService: RedisService);
    createAgent(config: AgentConfig): Promise<Agent>;
    getAgent(id: string): Promise<Agent | null>;
    updateAgent(id: string, config: Partial<AgentConfig>): Promise<Agent | null>;
    deleteAgent(id: string): Promise<boolean>;
    listAgents(): Promise<Agent[]>;
}
