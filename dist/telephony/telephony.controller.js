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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelephonyController = void 0;
const common_1 = require("@nestjs/common");
const telephony_service_1 = require("./telephony.service");
const express_1 = require("express");
const twilio_service_1 = require("./providers/twilio.service");
const plivo_service_1 = require("./providers/plivo.service");
let TelephonyController = class TelephonyController {
    telephonyService;
    twilioService;
    plivoService;
    constructor(telephonyService, twilioService, plivoService) {
        this.telephonyService = telephonyService;
        this.twilioService = twilioService;
        this.plivoService = plivoService;
    }
    async initiateCall(options) {
        const callId = await this.telephonyService.initiateCall(options);
        return { callId };
    }
    async endCall(callId, provider) {
        const success = await this.telephonyService.endCall(callId, provider);
        return { success };
    }
    async twilioWebhook(req, res) {
        return this.twilioService.handleWebhook(req, res);
    }
    async plivoWebhook(req, res) {
        return this.plivoService.handleWebhook(req, res);
    }
    getWebhookUrl(provider) {
        const url = this.telephonyService.getWebhookUrl(provider);
        return { url };
    }
};
exports.TelephonyController = TelephonyController;
__decorate([
    (0, common_1.Post)('call'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelephonyController.prototype, "initiateCall", null);
__decorate([
    (0, common_1.Delete)('call/:provider/:callId'),
    __param(0, (0, common_1.Param)('callId')),
    __param(1, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TelephonyController.prototype, "endCall", null);
__decorate([
    (0, common_1.Post)('twilio/webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _a : Object, typeof (_b = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], TelephonyController.prototype, "twilioWebhook", null);
__decorate([
    (0, common_1.Post)('plivo/webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof express_1.Request !== "undefined" && express_1.Request) === "function" ? _c : Object, typeof (_d = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], TelephonyController.prototype, "plivoWebhook", null);
__decorate([
    (0, common_1.Get)('webhook-url/:provider'),
    __param(0, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TelephonyController.prototype, "getWebhookUrl", null);
exports.TelephonyController = TelephonyController = __decorate([
    (0, common_1.Controller)('telephony'),
    __metadata("design:paramtypes", [telephony_service_1.TelephonyService,
        twilio_service_1.TwilioService,
        plivo_service_1.PlivoService])
], TelephonyController);
//# sourceMappingURL=telephony.controller.js.map