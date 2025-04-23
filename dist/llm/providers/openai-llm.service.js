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
var OpenAiLlmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiLlmService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let OpenAiLlmService = OpenAiLlmService_1 = class OpenAiLlmService {
    configService;
    logger = new common_1.Logger(OpenAiLlmService_1.name);
    apiKey;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('OPENAI_API_KEY');
        if (!this.apiKey) {
            this.logger.warn('OPENAI_API_KEY is not set. OpenAI LLM will not work properly.');
        }
    }
    async generateResponse(messages, options) {
        try {
            const model = options.model || 'gpt-3.5-turbo';
            const temperature = options.temperature || 0.7;
            const maxTokens = options.maxTokens || 150;
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model,
                messages,
                temperature,
                max_tokens: maxTokens,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const result = response.data;
            return {
                text: result.choices[0].message.content,
                usage: {
                    promptTokens: result.usage.prompt_tokens,
                    completionTokens: result.usage.completion_tokens,
                    totalTokens: result.usage.total_tokens,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error generating response with OpenAI: ${error.message}`);
            throw error;
        }
    }
    async streamResponse(messages, options, onChunk) {
        try {
            const model = options.model || 'gpt-3.5-turbo';
            const temperature = options.temperature || 0.7;
            const maxTokens = options.maxTokens || 150;
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model,
                messages,
                temperature,
                max_tokens: maxTokens,
                stream: true,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'stream',
            });
            let fullText = '';
            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    if (line.includes('[DONE]'))
                        continue;
                    try {
                        const parsedLine = JSON.parse(line.replace(/^data: /, ''));
                        const content = parsedLine.choices[0]?.delta?.content || '';
                        if (content) {
                            fullText += content;
                            onChunk(content);
                        }
                    }
                    catch (e) {
                    }
                }
            });
            return new Promise((resolve) => {
                response.data.on('end', () => {
                    resolve({
                        text: fullText,
                    });
                });
            });
        }
        catch (error) {
            this.logger.error(`Error streaming response with OpenAI: ${error.message}`);
            throw error;
        }
    }
};
exports.OpenAiLlmService = OpenAiLlmService;
exports.OpenAiLlmService = OpenAiLlmService = OpenAiLlmService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenAiLlmService);
//# sourceMappingURL=openai-llm.service.js.map