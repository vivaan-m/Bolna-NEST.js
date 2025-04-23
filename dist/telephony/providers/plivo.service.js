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
var PlivoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlivoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PlivoService = PlivoService_1 = class PlivoService {
    configService;
    logger = new common_1.Logger(PlivoService_1.name);
    authId;
    authToken;
    phoneNumber;
    constructor(configService) {
        this.configService = configService;
        this.authId = this.configService.get('PLIVO_AUTH_ID');
        this.authToken = this.configService.get('PLIVO_AUTH_TOKEN');
        this.phoneNumber = this.configService.get('PLIVO_PHONE_NUMBER');
        if (!this.authId || !this.authToken || !this.phoneNumber) {
            this.logger.warn('Plivo credentials are not fully set. Plivo telephony will not work properly.');
        }
    }
    async initiateCall(options) {
        try {
            this.logger.debug(`Initiating Plivo call to: ${options.to}`);
            return `plivo-call-${Date.now()}`;
        }
        catch (error) {
            this.logger.error(`Error initiating Plivo call: ${error.message}`);
            throw error;
        }
    }
    async endCall(callId) {
        try {
            this.logger.debug(`Ending Plivo call: ${callId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error ending Plivo call: ${error.message}`);
            throw error;
        }
    }
    async handleWebhook(req, res) {
        try {
            this.logger.debug('Handling Plivo webhook');
            res.setHeader('Content-Type', 'text/xml');
            res.send(`
        <Response>
          <Connect>
            <Stream url="wss://your-server-url/telephony/plivo/stream">
              <Parameter name="agentId" value="your-agent-id" />
            </Stream>
          </Connect>
        </Response>
      `);
        }
        catch (error) {
            this.logger.error(`Error handling Plivo webhook: ${error.message}`);
            res.status(500).send('Error handling webhook');
        }
    }
};
exports.PlivoService = PlivoService;
exports.PlivoService = PlivoService = PlivoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PlivoService);
//# sourceMappingURL=plivo.service.js.map