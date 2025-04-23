import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AgentService } from '../agent/agent.service';
import { AgentManagerService } from '../agent/manager/agent-manager.service';
export declare class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly agentService;
    private readonly agentManagerService;
    server: Server;
    private readonly logger;
    private readonly clients;
    constructor(agentService: AgentService, agentManagerService: AgentManagerService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegister(client: Socket, data: {
        agentId: string;
        callId?: string;
        provider?: string;
    }): Promise<void>;
    handleAudio(client: Socket, data: {
        audio: string;
    }): Promise<void>;
    handleText(client: Socket, data: {
        text: string;
    }): Promise<void>;
    handleReset(client: Socket): Promise<void>;
    handleHistory(client: Socket): Promise<void>;
    handleEndCall(client: Socket): Promise<void>;
}
