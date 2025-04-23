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
var DeepgramAsrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepgramAsrService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let DeepgramAsrService = DeepgramAsrService_1 = class DeepgramAsrService {
    configService;
    logger = new common_1.Logger(DeepgramAsrService_1.name);
    apiKey;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('DEEPGRAM_AUTH_TOKEN');
        if (!this.apiKey) {
            this.logger.warn('DEEPGRAM_AUTH_TOKEN is not set. Deepgram ASR will not work properly.');
        }
    }
    async transcribe(audioData, options) {
        try {
            const model = options.model || 'nova-2';
            const language = options.language || 'en';
            const response = await axios_1.default.post('https://api.deepgram.com/v1/listen', audioData, {
                headers: {
                    'Authorization': `Token ${this.apiKey}`,
                    'Content-Type': 'audio/raw',
                },
                params: {
                    model,
                    language,
                    encoding: 'linear16',
                    sample_rate: 16000,
                },
            });
            const result = response.data;
            const transcript = result.results?.channels[0]?.alternatives[0]?.transcript || '';
            const confidence = result.results?.channels[0]?.alternatives[0]?.confidence || 0;
            return {
                text: transcript,
                confidence,
                isFinal: true,
            };
        }
        catch (error) {
            this.logger.error(`Error transcribing with Deepgram: ${error.message}`);
            throw error;
        }
    }
    createStreamingSession(options) {
        return {
            send: (data) => {
                this.logger.debug('Sending audio data to Deepgram streaming session');
            },
            close: () => {
                this.logger.debug('Closing Deepgram streaming session');
            },
            onTranscript: (callback) => {
                this.logger.debug('Registered transcript callback for Deepgram streaming session');
            },
        };
    }
};
exports.DeepgramAsrService = DeepgramAsrService;
exports.DeepgramAsrService = DeepgramAsrService = DeepgramAsrService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DeepgramAsrService);
//# sourceMappingURL=deepgram-asr.service.js.map