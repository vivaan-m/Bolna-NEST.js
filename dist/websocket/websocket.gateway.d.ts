import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AgentService } from '../agent/agent.service';
import { AsrService } from '../asr/asr.service';
import { LlmService } from '../llm/llm.service';
import { TtsService } from '../tts/tts.service';
export declare class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly agentService;
    private readonly asrService;
    private readonly llmService;
    private readonly ttsService;
    server: Server;
    private readonly logger;
    private readonly clients;
    constructor(agentService: AgentService, asrService: AsrService, llmService: LlmService, ttsService: TtsService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegister(client: Socket, data: {
        agentId: string;
        callId?: string;
        provider?: string;
    }): Promise<void>;
    handleAudio(client: Socket, data: {
        audio: Buffer;
    }): Promise<void>;
    handleText(client: Socket, data: {
        text: string;
    }): Promise<void>;
    handleEndCall(client: Socket): Promise<void>;
}
