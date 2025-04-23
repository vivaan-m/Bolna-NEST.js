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
var ElevenLabsTtsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsTtsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let ElevenLabsTtsService = ElevenLabsTtsService_1 = class ElevenLabsTtsService {
    configService;
    logger = new common_1.Logger(ElevenLabsTtsService_1.name);
    apiKey;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('ELEVENLABS_API_KEY');
        if (!this.apiKey) {
            this.logger.warn('ELEVENLABS_API_KEY is not set. ElevenLabs TTS will not work properly.');
        }
    }
    async synthesize(text, options) {
        try {
            const voice = options.voice || 'Adam';
            this.logger.debug(`Synthesizing speech with ElevenLabs: ${text.substring(0, 50)}...`);
            const response = await axios_1.default.post(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                },
            }, {
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg',
                },
                responseType: 'arraybuffer',
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            this.logger.error(`Error synthesizing speech with ElevenLabs: ${error.message}`);
            throw error;
        }
    }
    async streamSynthesize(text, options, onChunk) {
        try {
            const voice = options.voice || 'Adam';
            this.logger.debug(`Streaming speech synthesis with ElevenLabs: ${text.substring(0, 50)}...`);
            const response = await axios_1.default.post(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`, {
                text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                },
            }, {
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'audio/mpeg',
                },
                responseType: 'stream',
            });
            response.data.on('data', (chunk) => {
                onChunk(chunk);
            });
            return new Promise((resolve, reject) => {
                response.data.on('end', resolve);
                response.data.on('error', reject);
            });
        }
        catch (error) {
            this.logger.error(`Error streaming speech synthesis with ElevenLabs: ${error.message}`);
            throw error;
        }
    }
};
exports.ElevenLabsTtsService = ElevenLabsTtsService;
exports.ElevenLabsTtsService = ElevenLabsTtsService = ElevenLabsTtsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ElevenLabsTtsService);
//# sourceMappingURL=elevenlabs-tts.service.js.map