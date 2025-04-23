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
var TtsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TtsService = void 0;
const common_1 = require("@nestjs/common");
const aws_polly_tts_service_1 = require("./providers/aws-polly-tts.service");
const elevenlabs_tts_service_1 = require("./providers/elevenlabs-tts.service");
let TtsService = TtsService_1 = class TtsService {
    awsPollyTtsService;
    elevenLabsTtsService;
    logger = new common_1.Logger(TtsService_1.name);
    constructor(awsPollyTtsService, elevenLabsTtsService) {
        this.awsPollyTtsService = awsPollyTtsService;
        this.elevenLabsTtsService = elevenLabsTtsService;
    }
    async synthesize(text, options) {
        this.logger.debug(`Synthesizing speech with provider: ${options.provider}`);
        switch (options.provider.toLowerCase()) {
            case 'aws':
            case 'polly':
            case 'aws-polly':
                return this.awsPollyTtsService.synthesize(text, options);
            case 'elevenlabs':
                return this.elevenLabsTtsService.synthesize(text, options);
            default:
                throw new Error(`Unsupported TTS provider: ${options.provider}`);
        }
    }
    async streamSynthesize(text, options, onChunk) {
        this.logger.debug(`Streaming speech synthesis with provider: ${options.provider}`);
        switch (options.provider.toLowerCase()) {
            case 'aws':
            case 'polly':
            case 'aws-polly':
                return this.awsPollyTtsService.streamSynthesize(text, options, onChunk);
            case 'elevenlabs':
                return this.elevenLabsTtsService.streamSynthesize(text, options, onChunk);
            default:
                throw new Error(`Unsupported TTS provider: ${options.provider}`);
        }
    }
};
exports.TtsService = TtsService;
exports.TtsService = TtsService = TtsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [aws_polly_tts_service_1.AwsPollyTtsService,
        elevenlabs_tts_service_1.ElevenLabsTtsService])
], TtsService);
//# sourceMappingURL=tts.service.js.map