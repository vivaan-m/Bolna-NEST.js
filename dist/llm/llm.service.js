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
var LlmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmService = void 0;
const common_1 = require("@nestjs/common");
const openai_llm_service_1 = require("./providers/openai-llm.service");
let LlmService = LlmService_1 = class LlmService {
    openAiLlmService;
    logger = new common_1.Logger(LlmService_1.name);
    constructor(openAiLlmService) {
        this.openAiLlmService = openAiLlmService;
    }
    async generateResponse(messages, options) {
        this.logger.debug(`Generating response with provider: ${options.provider}, model: ${options.model}`);
        switch (options.provider.toLowerCase()) {
            case 'openai':
                return this.openAiLlmService.generateResponse(messages, options);
            default:
                throw new Error(`Unsupported LLM provider: ${options.provider}`);
        }
    }
    async streamResponse(messages, options, onChunk) {
        this.logger.debug(`Streaming response with provider: ${options.provider}, model: ${options.model}`);
        switch (options.provider.toLowerCase()) {
            case 'openai':
                return this.openAiLlmService.streamResponse(messages, options, onChunk);
            default:
                throw new Error(`Unsupported LLM provider: ${options.provider}`);
        }
    }
};
exports.LlmService = LlmService;
exports.LlmService = LlmService = LlmService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_llm_service_1.OpenAiLlmService])
], LlmService);
//# sourceMappingURL=llm.service.js.map