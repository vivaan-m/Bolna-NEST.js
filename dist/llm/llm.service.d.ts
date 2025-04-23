import { OpenAiLlmService } from './providers/openai-llm.service';
export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: string;
}
export interface LlmOptions {
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    options?: any;
}
export interface LlmResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export declare class LlmService {
    private readonly openAiLlmService;
    private readonly logger;
    constructor(openAiLlmService: OpenAiLlmService);
    generateResponse(messages: Message[], options: LlmOptions): Promise<LlmResponse>;
    streamResponse(messages: Message[], options: LlmOptions, onChunk: (chunk: string) => void): Promise<LlmResponse>;
}
