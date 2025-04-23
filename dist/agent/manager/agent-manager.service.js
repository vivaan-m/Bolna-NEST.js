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
var AgentManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManagerService = void 0;
const common_1 = require("@nestjs/common");
const agent_service_1 = require("../agent.service");
const memory_service_1 = require("../memory/memory.service");
const task_service_1 = require("../tasks/task.service");
const llm_service_1 = require("../../llm/llm.service");
const asr_service_1 = require("../../asr/asr.service");
const tts_service_1 = require("../../tts/tts.service");
let AgentManagerService = AgentManagerService_1 = class AgentManagerService {
    agentService;
    memoryService;
    taskService;
    llmService;
    asrService;
    ttsService;
    logger = new common_1.Logger(AgentManagerService_1.name);
    conversations = new Map();
    constructor(agentService, memoryService, taskService, llmService, asrService, ttsService) {
        this.agentService = agentService;
        this.memoryService = memoryService;
        this.taskService = taskService;
        this.llmService = llmService;
        this.asrService = asrService;
        this.ttsService = ttsService;
    }
    async processAudio(agentId, audioData, streamResponse) {
        try {
            const agent = await this.agentService.getAgent(agentId);
            if (!agent) {
                throw new Error(`Agent with ID ${agentId} not found`);
            }
            const transcription = await this.asrService.transcribe(audioData, agent.config.asr);
            return this.processText(agentId, transcription.text, streamResponse);
        }
        catch (error) {
            this.logger.error(`Error processing audio for agent ${agentId}: ${error.message}`);
            throw error;
        }
    }
    async processText(agentId, text, streamResponse) {
        try {
            const agent = await this.agentService.getAgent(agentId);
            if (!agent) {
                throw new Error(`Agent with ID ${agentId} not found`);
            }
            let conversation = this.conversations.get(agentId);
            if (!conversation) {
                conversation = [];
                if (agent.config.llm.systemPrompt) {
                    conversation.push({
                        role: 'system',
                        content: agent.config.llm.systemPrompt,
                    });
                }
                else if (agent.conversation_details?.system_prompt) {
                    conversation.push({
                        role: 'system',
                        content: agent.conversation_details.system_prompt,
                    });
                }
                this.conversations.set(agentId, conversation);
            }
            const userMessage = {
                role: 'user',
                content: text,
            };
            conversation.push(userMessage);
            if (agent.config.memory) {
                await this.memoryService.addMessage(agentId, userMessage, agent.config.memory);
            }
            let assistantResponse;
            if (streamResponse) {
                let fullResponse = '';
                await this.llmService.streamResponse(conversation, agent.config.llm, (chunk) => {
                    fullResponse += chunk;
                });
                assistantResponse = fullResponse;
            }
            else {
                const response = await this.llmService.generateResponse(conversation, agent.config.llm);
                assistantResponse = response.text;
            }
            const assistantMessage = {
                role: 'assistant',
                content: assistantResponse,
            };
            conversation.push(assistantMessage);
            if (agent.config.memory) {
                await this.memoryService.addMessage(agentId, assistantMessage, agent.config.memory);
            }
            let taskResults = [];
            if (agent.config.tasks && agent.config.tasks.length > 0) {
                taskResults = await Promise.all(agent.config.tasks
                    .filter(task => task.enabled)
                    .map(task => this.taskService.executeTask(task, conversation)));
            }
            let audioBuffer;
            if (streamResponse) {
                await this.ttsService.streamSynthesize(assistantResponse, agent.config.tts, streamResponse);
            }
            else {
                audioBuffer = await this.ttsService.synthesize(assistantResponse, agent.config.tts);
            }
            return {
                text: assistantResponse,
                audio: audioBuffer,
                taskResults,
            };
        }
        catch (error) {
            this.logger.error(`Error processing text for agent ${agentId}: ${error.message}`);
            throw error;
        }
    }
    async resetConversation(agentId) {
        try {
            this.conversations.delete(agentId);
            const agent = await this.agentService.getAgent(agentId);
            if (!agent || !agent.config.memory) {
                return;
            }
            await this.memoryService.clearMemory(agentId, agent.config.memory);
        }
        catch (error) {
            this.logger.error(`Error resetting conversation for agent ${agentId}: ${error.message}`);
            throw error;
        }
    }
    async getConversationHistory(agentId) {
        try {
            const agent = await this.agentService.getAgent(agentId);
            if (!agent) {
                throw new Error(`Agent with ID ${agentId} not found`);
            }
            if (agent.config.memory) {
                return this.memoryService.getMessages(agentId, agent.config.memory);
            }
            return this.conversations.get(agentId) || [];
        }
        catch (error) {
            this.logger.error(`Error getting conversation history for agent ${agentId}: ${error.message}`);
            throw error;
        }
    }
};
exports.AgentManagerService = AgentManagerService;
exports.AgentManagerService = AgentManagerService = AgentManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_service_1.AgentService,
        memory_service_1.MemoryService,
        task_service_1.TaskService,
        llm_service_1.LlmService,
        asr_service_1.AsrService,
        tts_service_1.TtsService])
], AgentManagerService);
//# sourceMappingURL=agent-manager.service.js.map