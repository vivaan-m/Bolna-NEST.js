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
var AgentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const agent_service_1 = require("./agent.service");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AsrConfigDto {
    provider;
    model;
    language;
    options;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AsrConfigDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsrConfigDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AsrConfigDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AsrConfigDto.prototype, "options", void 0);
class LlmConfigDto {
    provider;
    model;
    temperature;
    maxTokens;
    options;
    systemPrompt;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LlmConfigDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LlmConfigDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LlmConfigDto.prototype, "temperature", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LlmConfigDto.prototype, "maxTokens", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], LlmConfigDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LlmConfigDto.prototype, "systemPrompt", void 0);
class TtsConfigDto {
    provider;
    voice;
    language;
    options;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TtsConfigDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TtsConfigDto.prototype, "voice", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TtsConfigDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], TtsConfigDto.prototype, "options", void 0);
class ExtractionToolConfigDto {
    llm_agent;
}
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ExtractionToolConfigDto.prototype, "llm_agent", void 0);
class ClassificationToolConfigDto {
    llm_agent;
}
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], ClassificationToolConfigDto.prototype, "llm_agent", void 0);
class CustomToolConfigDto {
    function_name;
    parameters;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomToolConfigDto.prototype, "function_name", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CustomToolConfigDto.prototype, "parameters", void 0);
class TaskConfigDto {
    task_type;
    task_name;
    tools_config;
    enabled;
}
__decorate([
    (0, class_validator_1.IsEnum)(agent_service_1.TaskType),
    __metadata("design:type", String)
], TaskConfigDto.prototype, "task_type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaskConfigDto.prototype, "task_name", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TaskConfigDto.prototype, "tools_config", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TaskConfigDto.prototype, "enabled", void 0);
class MemoryConfigDto {
    type;
    max_messages;
    storage_type;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MemoryConfigDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MemoryConfigDto.prototype, "max_messages", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MemoryConfigDto.prototype, "storage_type", void 0);
class AgentConfigDto {
    name;
    description;
    asr;
    llm;
    tts;
    tasks;
    memory;
    metadata;
    assistant_status;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AgentConfigDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AgentConfigDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AsrConfigDto),
    __metadata("design:type", AsrConfigDto)
], AgentConfigDto.prototype, "asr", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LlmConfigDto),
    __metadata("design:type", LlmConfigDto)
], AgentConfigDto.prototype, "llm", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TtsConfigDto),
    __metadata("design:type", TtsConfigDto)
], AgentConfigDto.prototype, "tts", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TaskConfigDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AgentConfigDto.prototype, "tasks", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MemoryConfigDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", MemoryConfigDto)
], AgentConfigDto.prototype, "memory", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AgentConfigDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AgentConfigDto.prototype, "assistant_status", void 0);
class ConversationDetailsDto {
    system_prompt;
    user_prompt_templates;
    assistant_prompt_templates;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConversationDetailsDto.prototype, "system_prompt", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ConversationDetailsDto.prototype, "user_prompt_templates", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ConversationDetailsDto.prototype, "assistant_prompt_templates", void 0);
class CreateAgentDto {
    config;
    conversation_details;
}
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AgentConfigDto),
    __metadata("design:type", AgentConfigDto)
], CreateAgentDto.prototype, "config", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ConversationDetailsDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ConversationDetailsDto)
], CreateAgentDto.prototype, "conversation_details", void 0);
class UpdateAgentDto {
    config;
    conversation_details;
}
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AgentConfigDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateAgentDto.prototype, "config", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ConversationDetailsDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ConversationDetailsDto)
], UpdateAgentDto.prototype, "conversation_details", void 0);
let AgentController = AgentController_1 = class AgentController {
    agentService;
    logger = new common_1.Logger(AgentController_1.name);
    constructor(agentService) {
        this.agentService = agentService;
    }
    async createAgent(createAgentDto) {
        try {
            return await this.agentService.createAgent(createAgentDto.config, createAgentDto.conversation_details);
        }
        catch (error) {
            this.logger.error(`Error creating agent: ${error.message}`, error.stack);
            throw new common_1.HttpException(`Failed to create agent: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAgent(id) {
        try {
            const agent = await this.agentService.getAgent(id);
            if (!agent) {
                throw new common_1.NotFoundException(`Agent with ID ${id} not found`);
            }
            return agent;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error getting agent ${id}: ${error.message}`, error.stack);
            throw new common_1.HttpException(`Failed to get agent: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateAgent(id, updateAgentDto) {
        try {
            const agent = await this.agentService.updateAgent(id, updateAgentDto.config || {}, updateAgentDto.conversation_details);
            if (!agent) {
                throw new common_1.NotFoundException(`Agent with ID ${id} not found`);
            }
            return agent;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error updating agent ${id}: ${error.message}`, error.stack);
            throw new common_1.HttpException(`Failed to update agent: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteAgent(id) {
        try {
            const deleted = await this.agentService.deleteAgent(id);
            if (!deleted) {
                throw new common_1.NotFoundException(`Agent with ID ${id} not found`);
            }
            return { success: true, message: `Agent ${id} deleted successfully` };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error deleting agent ${id}: ${error.message}`, error.stack);
            throw new common_1.HttpException(`Failed to delete agent: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async listAgents(limit, offset, sort) {
        try {
            const agents = await this.agentService.listAgents();
            let result = agents;
            if (offset !== undefined) {
                const startIndex = Number(offset) || 0;
                result = result.slice(startIndex);
            }
            if (limit !== undefined) {
                const limitNum = Number(limit) || 10;
                result = result.slice(0, limitNum);
            }
            if (sort) {
                const [field, order] = sort.split(':');
                result.sort((a, b) => {
                    let valueA;
                    let valueB;
                    if (field.includes('.')) {
                        const parts = field.split('.');
                        valueA = parts.reduce((obj, key) => obj?.[key], a);
                        valueB = parts.reduce((obj, key) => obj?.[key], b);
                    }
                    else {
                        valueA = a[field];
                        valueB = b[field];
                    }
                    if (typeof valueA === 'string') {
                        return order === 'desc'
                            ? valueB.localeCompare(valueA)
                            : valueA.localeCompare(valueB);
                    }
                    else {
                        return order === 'desc'
                            ? valueB - valueA
                            : valueA - valueB;
                    }
                });
            }
            return {
                total: agents.length,
                limit: limit ? Number(limit) : agents.length,
                offset: offset ? Number(offset) : 0,
                agents: result,
            };
        }
        catch (error) {
            this.logger.error(`Error listing agents: ${error.message}`, error.stack);
            throw new common_1.HttpException(`Failed to list agents: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAgentDto]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "createAgent", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getAgent", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateAgentDto]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "updateAgent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "deleteAgent", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('sort')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "listAgents", null);
exports.AgentController = AgentController = AgentController_1 = __decorate([
    (0, common_1.Controller)('agents'),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
//# sourceMappingURL=agent.controller.js.map