import { ConfigService } from '@nestjs/config';
import { LlmOptions, LlmResponse, Message } from '../llm.service';
export declare class OpenAiLlmService {
    private readonly configService;
    private readonly logger;
    private readonly apiKey?;
    constructor(configService: ConfigService);
    generateResponse(messages: Message[], options: LlmOptions): Promise<LlmResponse>;
    streamResponse(messages: Message[], options: LlmOptions, onChunk: (chunk: string) => void): Promise<LlmResponse>;
}
