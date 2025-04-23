"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebsocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const agent_service_1 = require("../agent/agent.service");
const agent_manager_service_1 = require("../agent/manager/agent-manager.service");
let WebsocketGateway = WebsocketGateway_1 = class WebsocketGateway {
    agentService;
    agentManagerService;
    server;
    logger = new common_1.Logger(WebsocketGateway_1.name);
    clients = new Map();
    constructor(agentService, agentManagerService) {
        this.agentService = agentService;
        this.agentManagerService = agentManagerService;
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        this.clients.set(client.id, { socket: client });
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const clientData = this.clients.get(client.id);
        if (clientData?.agentId) {
            this.agentManagerService.resetConversation(clientData.agentId)
                .catch(error => this.logger.error(`Error resetting conversation: ${error.message}`));
        }
        this.clients.delete(client.id);
    }
    async handleRegister(client, data) {
        try {
            const { agentId, callId, provider } = data;
            this.logger.log(`Registering client ${client.id} with agent ${agentId}`);
            const agent = await this.agentService.getAgent(agentId);
            if (!agent) {
                client.emit('error', { message: `Agent with ID ${agentId} not found` });
                return;
            }
            this.clients.set(client.id, {
                socket: client,
                agentId,
                callId,
                provider,
            });
            await this.agentManagerService.resetConversation(agentId);
            client.emit('registered', {
                agentId,
                agent: {
                    name: agent.config.name,
                    description: agent.config.description,
                }
            });
            if (agent.conversation_details?.system_prompt) {
                const welcomeMessage = agent.conversation_details.system_prompt
                    .split('[WELCOME_MESSAGE]')[1]?.trim();
                if (welcomeMessage) {
                    const response = await this.agentManagerService.processText(agentId, welcomeMessage, (chunk) => {
                        client.emit('audio-chunk', { audio: chunk.toString('base64') });
                    });
                    client.emit('message', {
                        role: 'assistant',
                        content: response.text,
                        taskResults: response.taskResults,
                    });
                }
            }
        }
        catch (error) {
            this.logger.error(`Error registering client: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }
    async handleAudio(client, data) {
        try {
            const clientData = this.clients.get(client.id);
            if (!clientData?.agentId) {
                client.emit('error', { message: 'Client not registered with an agent' });
                return;
            }
            const audioBuffer = Buffer.from(data.audio, 'base64');
            const response = await this.agentManagerService.processAudio(clientData.agentId, audioBuffer, (chunk) => {
                client.emit('audio-chunk', { audio: chunk.toString('base64') });
            });
            client.emit('message', {
                role: 'assistant',
                content: response.text,
                taskResults: response.taskResults,
            });
        }
        catch (error) {
            this.logger.error(`Error processing audio: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }
    async handleText(client, data) {
        try {
            const clientData = this.clients.get(client.id);
            if (!clientData?.agentId) {
                client.emit('error', { message: 'Client not registered with an agent' });
                return;
            }
            client.emit('message', {
                role: 'user',
                content: data.text
            });
            const response = await this.agentManagerService.processText(clientData.agentId, data.text, (chunk) => {
                client.emit('audio-chunk', { audio: chunk.toString('base64') });
            });
            client.emit('message', {
                role: 'assistant',
                content: response.text,
                taskResults: response.taskResults,
            });
        }
        catch (error) {
            this.logger.error(`Error processing text: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }
    async handleReset(client) {
        try {
            const clientData = this.clients.get(client.id);
            if (!clientData?.agentId) {
                client.emit('error', { message: 'Client not registered with an agent' });
                return;
            }
            await this.agentManagerService.resetConversation(clientData.agentId);
            client.emit('reset', { success: true });
        }
        catch (error) {
            this.logger.error(`Error resetting conversation: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }
    async handleHistory(client) {
        try {
            const clientData = this.clients.get(client.id);
            if (!clientData?.agentId) {
                client.emit('error', { message: 'Client not registered with an agent' });
                return;
            }
            const history = await this.agentManagerService.getConversationHistory(clientData.agentId);
            client.emit('history', { messages: history });
        }
        catch (error) {
            this.logger.error(`Error getting conversation history: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }
    async handleEndCall(client) {
        try {
            const clientData = this.clients.get(client.id);
            if (!clientData?.callId || !clientData?.provider) {
                client.emit('error', { message: 'No active call to end' });
                return;
            }
            client.emit('call-ended', { callId: clientData.callId });
            this.clients.set(client.id, {
                ...clientData,
                callId: undefined,
                provider: undefined,
            });
        }
        catch (error) {
            this.logger.error(`Error ending call: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }
};
exports.WebsocketGateway = WebsocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebsocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('register'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "handleRegister", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('audio'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "handleAudio", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('text'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "handleText", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('reset'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "handleReset", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('history'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "handleHistory", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('end-call'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "handleEndCall", null);
exports.WebsocketGateway = WebsocketGateway = WebsocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [agent_service_1.AgentService,
        agent_manager_service_1.AgentManagerService])
], WebsocketGateway);
//# sourceMappingURL=websocket.gateway.js.map