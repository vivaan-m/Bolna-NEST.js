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
const asr_service_1 = require("../asr/asr.service");
const llm_service_1 = require("../llm/llm.service");
const tts_service_1 = require("../tts/tts.service");
let WebsocketGateway = WebsocketGateway_1 = class WebsocketGateway {
    agentService;
    asrService;
    llmService;
    ttsService;
    server;
    logger = new common_1.Logger(WebsocketGateway_1.name);
    clients = new Map();
    constructor(agentService, asrService, llmService, ttsService) {
        this.agentService = agentService;
        this.asrService = asrService;
        this.llmService = llmService;
        this.ttsService = ttsService;
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        this.clients.set(client.id, {
            socket: client,
            conversation: []
        });
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
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
            const clientData = this.clients.get(client.id);
            if (clientData) {
                this.clients.set(client.id, {
                    ...clientData,
                    agentId,
                    callId,
                    provider,
                    conversation: [
                        {
                            role: 'system',
                            content: agent.config.llm.systemPrompt || 'You are a helpful assistant.',
                        },
                    ],
                });
            }
            client.emit('registered', { agentId });
        }
        catch (error) {
            this.logger.error(`Error registering client: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }
    async handleAudio(client, data) {
        try {
            const clientData = this.clients.get(client.id);
            if (!clientData || !clientData.agentId) {
                client.emit('error', { message: 'Client not registered with an agent' });
                return;
            }
            const agent = await this.agentService.getAgent(clientData.agentId);
            if (!agent) {
                client.emit('error', { message: `Agent with ID ${clientData.agentId} not found` });
                return;
            }
            const asrResult = await this.asrService.transcribe(data.audio, agent.config.asr);
            if (asrResult.text.trim() === '') {
                return;
            }
            client.emit('transcript', { text: asrResult.text, isFinal: asrResult.isFinal });
            if (!asrResult.isFinal) {
                return;
            }
            clientData.conversation.push({
                role: 'user',
                content: asrResult.text,
            });
            let fullResponse = '';
            await this.llmService.streamResponse(clientData.conversation, agent.config.llm, (chunk) => {
                client.emit('llm-chunk', { text: chunk });
                fullResponse += chunk;
            });
            clientData.conversation.push({
                role: 'assistant',
                content: fullResponse,
            });
            await this.ttsService.streamSynthesize(fullResponse, agent.config.tts, (chunk) => {
                client.emit('audio-chunk', { audio: chunk });
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
            if (!clientData || !clientData.agentId) {
                client.emit('error', { message: 'Client not registered with an agent' });
                return;
            }
            const agent = await this.agentService.getAgent(clientData.agentId);
            if (!agent) {
                client.emit('error', { message: `Agent with ID ${clientData.agentId} not found` });
                return;
            }
            clientData.conversation.push({
                role: 'user',
                content: data.text,
            });
            let fullResponse = '';
            await this.llmService.streamResponse(clientData.conversation, agent.config.llm, (chunk) => {
                client.emit('llm-chunk', { text: chunk });
                fullResponse += chunk;
            });
            clientData.conversation.push({
                role: 'assistant',
                content: fullResponse,
            });
            await this.ttsService.streamSynthesize(fullResponse, agent.config.tts, (chunk) => {
                client.emit('audio-chunk', { audio: chunk });
            });
        }
        catch (error) {
            this.logger.error(`Error processing text: ${error.message}`);
            client.emit('error', { message: error.message });
        }
    }
    async handleEndCall(client) {
        try {
            const clientData = this.clients.get(client.id);
            if (!clientData || !clientData.callId || !clientData.provider) {
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
        asr_service_1.AsrService,
        llm_service_1.LlmService,
        tts_service_1.TtsService])
], WebsocketGateway);
//# sourceMappingURL=websocket.gateway.js.map