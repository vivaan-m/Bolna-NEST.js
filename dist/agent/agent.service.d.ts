import { RedisService } from '../redis/redis.service';
import { LlmService } from '../llm/llm.service';
export declare enum TaskType {
    EXTRACTION = "extraction",
    CLASSIFICATION = "classification",
    CUSTOM = "custom"
}
export declare enum ToolType {
    LLM_AGENT = "llm_agent",
    API = "api",
    FUNCTION = "function"
}
export interface AsrConfig {
    provider: string;
    model?: string;
    language?: string;
    options?: Record<string, any>;
}
export interface LlmConfig {
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    options?: Record<string, any>;
    systemPrompt?: string;
}
export interface TtsConfig {
    provider: string;
    voice?: string;
    language?: string;
    options?: Record<string, any>;
}
export interface ExtractionToolConfig {
    llm_agent: {
        extraction_details: string;
        extraction_json?: string;
    };
}
export interface ClassificationToolConfig {
    llm_agent: {
        classification_details: string;
        classification_json?: string;
        classes: string[];
    };
}
export interface CustomToolConfig {
    function_name: string;
    parameters?: Record<string, any>;
}
export interface TaskConfig {
    task_type: TaskType;
    task_name: string;
    tools_config: ExtractionToolConfig | ClassificationToolConfig | CustomToolConfig;
    enabled: boolean;
}
export interface MemoryConfig {
    type: 'short_term' | 'long_term' | 'both';
    max_messages?: number;
    storage_type?: 'redis' | 'file';
}
export interface AgentConfig {
    name: string;
    description?: string;
    asr: AsrConfig;
    llm: LlmConfig;
    tts: TtsConfig;
    tasks?: TaskConfig[];
    memory?: MemoryConfig;
    metadata?: Record<string, any>;
    assistant_status?: string;
}
export interface ConversationDetails {
    system_prompt?: string;
    user_prompt_templates?: Record<string, string>;
    assistant_prompt_templates?: Record<string, string>;
}
export interface Agent {
    id: string;
    config: AgentConfig;
    conversation_details?: ConversationDetails;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AgentService {
    private readonly redisService;
    private readonly llmService?;
    private readonly logger;
    private readonly agentDataDir;
    constructor(redisService: RedisService, llmService?: LlmService | undefined);
    createAgent(config: AgentConfig, conversationDetails?: ConversationDetails): Promise<Agent>;
    getAgent(id: string): Promise<Agent | null>;
    updateAgent(id: string, config: Partial<AgentConfig>, conversationDetails?: ConversationDetails): Promise<Agent | null>;
    deleteAgent(id: string): Promise<boolean>;
    listAgents(): Promise<Agent[]>;
    private processTasks;
    private storeConversationDetails;
    private loadConversationDetails;
}
