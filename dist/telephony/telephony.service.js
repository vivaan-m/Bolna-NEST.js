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
var TelephonyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelephonyService = void 0;
const common_1 = require("@nestjs/common");
const twilio_service_1 = require("./providers/twilio.service");
const plivo_service_1 = require("./providers/plivo.service");
let TelephonyService = TelephonyService_1 = class TelephonyService {
    twilioService;
    plivoService;
    logger = new common_1.Logger(TelephonyService_1.name);
    constructor(twilioService, plivoService) {
        this.twilioService = twilioService;
        this.plivoService = plivoService;
    }
    async initiateCall(options) {
        this.logger.debug(`Initiating call with provider: ${options.provider}`);
        switch (options.provider.toLowerCase()) {
            case 'twilio':
                return this.twilioService.initiateCall(options);
            case 'plivo':
                return this.plivoService.initiateCall(options);
            default:
                throw new Error(`Unsupported telephony provider: ${options.provider}`);
        }
    }
    async endCall(callId, provider) {
        this.logger.debug(`Ending call ${callId} with provider: ${provider}`);
        switch (provider.toLowerCase()) {
            case 'twilio':
                return this.twilioService.endCall(callId);
            case 'plivo':
                return this.plivoService.endCall(callId);
            default:
                throw new Error(`Unsupported telephony provider: ${provider}`);
        }
    }
    getWebhookUrl(provider) {
        switch (provider.toLowerCase()) {
            case 'twilio':
                return '/telephony/twilio/webhook';
            case 'plivo':
                return '/telephony/plivo/webhook';
            default:
                throw new Error(`Unsupported telephony provider: ${provider}`);
        }
    }
};
exports.TelephonyService = TelephonyService;
exports.TelephonyService = TelephonyService = TelephonyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [twilio_service_1.TwilioService,
        plivo_service_1.PlivoService])
], TelephonyService);
//# sourceMappingURL=telephony.service.js.map