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
var AsrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsrService = void 0;
const common_1 = require("@nestjs/common");
const deepgram_asr_service_1 = require("./providers/deepgram-asr.service");
let AsrService = AsrService_1 = class AsrService {
    deepgramAsrService;
    logger = new common_1.Logger(AsrService_1.name);
    constructor(deepgramAsrService) {
        this.deepgramAsrService = deepgramAsrService;
    }
    async transcribe(audioData, options) {
        this.logger.debug(`Transcribing audio with provider: ${options.provider}`);
        switch (options.provider.toLowerCase()) {
            case 'deepgram':
                return this.deepgramAsrService.transcribe(audioData, options);
            default:
                throw new Error(`Unsupported ASR provider: ${options.provider}`);
        }
    }
    createStreamingSession(options) {
        this.logger.debug(`Creating streaming session with provider: ${options.provider}`);
        switch (options.provider.toLowerCase()) {
            case 'deepgram':
                return this.deepgramAsrService.createStreamingSession(options);
            default:
                throw new Error(`Unsupported ASR provider: ${options.provider}`);
        }
    }
};
exports.AsrService = AsrService;
exports.AsrService = AsrService = AsrService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [deepgram_asr_service_1.DeepgramAsrService])
], AsrService);
//# sourceMappingURL=asr.service.js.map