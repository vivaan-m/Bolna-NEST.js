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
var AwsPollyTtsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsPollyTtsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AwsPollyTtsService = AwsPollyTtsService_1 = class AwsPollyTtsService {
    configService;
    logger = new common_1.Logger(AwsPollyTtsService_1.name);
    constructor(configService) {
        this.configService = configService;
        this.logger.log('AWS Polly TTS service initialized');
    }
    async synthesize(text, options) {
        try {
            this.logger.debug(`Synthesizing speech with AWS Polly: ${text.substring(0, 50)}...`);
            return Buffer.from('Mock audio data');
        }
        catch (error) {
            this.logger.error(`Error synthesizing speech with AWS Polly: ${error.message}`);
            throw error;
        }
    }
    async streamSynthesize(text, options, onChunk) {
        try {
            this.logger.debug(`Streaming speech synthesis with AWS Polly: ${text.substring(0, 50)}...`);
            const mockAudioData = Buffer.from('Mock audio data');
            const chunkSize = 1024;
            for (let i = 0; i < mockAudioData.length; i += chunkSize) {
                const chunk = mockAudioData.slice(i, i + chunkSize);
                onChunk(chunk);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        catch (error) {
            this.logger.error(`Error streaming speech synthesis with AWS Polly: ${error.message}`);
            throw error;
        }
    }
};
exports.AwsPollyTtsService = AwsPollyTtsService;
exports.AwsPollyTtsService = AwsPollyTtsService = AwsPollyTtsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AwsPollyTtsService);
//# sourceMappingURL=aws-polly-tts.service.js.map