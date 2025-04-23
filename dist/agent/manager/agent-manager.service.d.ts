import { AgentService } from '../agent.service';
import { MemoryService } from '../memory/memory.service';
import { TaskService, TaskResult } from '../tasks/task.service';
import { LlmService, Message } from '../../llm/llm.service';
import { AsrService } from '../../asr/asr.service';
import { TtsService } from '../../tts/tts.service';
export interface AgentResponse {
    text: string;
    audio?: Buffer;
    taskResults?: TaskResult[];
}
export declare class AgentManagerService {
    private readonly agentService;
    private readonly memoryService;
    private readonly taskService;
    private readonly llmService;
    private readonly asrService;
    private readonly ttsService;
    private readonly logger;
    private readonly conversations;
    constructor(agentService: AgentService, memoryService: MemoryService, taskService: TaskService, llmService: LlmService, asrService: AsrService, ttsService: TtsService);
    processAudio(agentId: string, audioData: Buffer, streamResponse?: (chunk: Buffer) => void): Promise<AgentResponse>;
    processText(agentId: string, text: string, streamResponse?: (chunk: Buffer) => void): Promise<AgentResponse>;
    resetConversation(agentId: string): Promise<void>;
    getConversationHistory(agentId: string): Promise<Message[]>;
}
