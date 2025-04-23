import { AgentService, AgentConfig, ConversationDetails, TaskType } from './agent.service';
declare class AsrConfigDto {
    provider: string;
    model?: string;
    language?: string;
    options?: Record<string, any>;
}
declare class LlmConfigDto {
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    options?: Record<string, any>;
    systemPrompt?: string;
}
declare class TtsConfigDto {
    provider: string;
    voice?: string;
    language?: string;
    options?: Record<string, any>;
}
declare class ExtractionToolConfigDto {
    llm_agent: {
        extraction_details: string;
        extraction_json?: string;
    };
}
declare class ClassificationToolConfigDto {
    llm_agent: {
        classification_details: string;
        classification_json?: string;
        classes: string[];
    };
}
declare class CustomToolConfigDto {
    function_name: string;
    parameters?: Record<string, any>;
}
declare class TaskConfigDto {
    task_type: TaskType;
    task_name: string;
    tools_config: ExtractionToolConfigDto | ClassificationToolConfigDto | CustomToolConfigDto;
    enabled: boolean;
}
declare class MemoryConfigDto {
    type: 'short_term' | 'long_term' | 'both';
    max_messages?: number;
    storage_type?: 'redis' | 'file';
}
declare class AgentConfigDto implements AgentConfig {
    name: string;
    description?: string;
    asr: AsrConfigDto;
    llm: LlmConfigDto;
    tts: TtsConfigDto;
    tasks?: TaskConfigDto[];
    memory?: MemoryConfigDto;
    metadata?: Record<string, any>;
    assistant_status?: string;
}
declare class ConversationDetailsDto implements ConversationDetails {
    system_prompt?: string;
    user_prompt_templates?: Record<string, string>;
    assistant_prompt_templates?: Record<string, string>;
}
declare class UpdateAgentDto {
    config?: Partial<AgentConfigDto>;
    conversation_details?: ConversationDetailsDto;
}
export declare class AgentController {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: AgentService);
    createAgent(body: AgentConfigDto): Promise<import("./agent.service").Agent>;
    getAgent(id: string): Promise<import("./agent.service").Agent>;
    updateAgent(id: string, updateAgentDto: UpdateAgentDto): Promise<import("./agent.service").Agent>;
    deleteAgent(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    listAgents(limit?: number, offset?: number, sort?: string): Promise<{
        total: number;
        limit: number;
        offset: number;
        agents: import("./agent.service").Agent[];
    }>;
}
export {};
