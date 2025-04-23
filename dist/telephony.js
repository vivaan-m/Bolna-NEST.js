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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const telephony_module_1 = require("./telephony/telephony.module");
const redis_module_1 = require("./redis/redis.module");
const websocket_module_1 = require("./websocket/websocket.module");
const agent_module_1 = require("./agent/agent.module");
const asr_module_1 = require("./asr/asr.module");
const llm_module_1 = require("./llm/llm.module");
const tts_module_1 = require("./tts/tts.module");
let TelephonyServerService = class TelephonyServerService {
    getWelcome() {
        return `
      <html>
        <head>
          <title>Bolna - Telephony Server</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 {
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .endpoints {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            code {
              background-color: #eee;
              padding: 2px 5px;
              border-radius: 3px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <h1>Bolna - Telephony Server</h1>
          <p>Welcome to the Bolna Telephony Server. This server handles telephony operations for the Bolna Voice AI Platform.</p>
          
          <div class="endpoints">
            <h2>Telephony Server Endpoints (Port 3001):</h2>
            <ul>
              <li><code>POST /telephony/call</code> - Initiate a call</li>
              <li><code>DELETE /telephony/call/:provider/:callId</code> - End a call</li>
              <li><code>POST /telephony/twilio/webhook</code> - Twilio webhook endpoint</li>
              <li><code>POST /telephony/plivo/webhook</code> - Plivo webhook endpoint</li>
              <li><code>GET /telephony/webhook-url/:provider</code> - Get webhook URL for provider</li>
            </ul>
          </div>
          
          <div class="endpoints">
            <h2>API Server Endpoints (Port 3000):</h2>
            <ul>
              <li><code>GET /agents</code> - List all agents</li>
              <li><code>POST /agents</code> - Create a new agent</li>
              <li><code>GET /agents/:id</code> - Get an agent by ID</li>
              <li><code>PUT /agents/:id</code> - Update an agent</li>
              <li><code>DELETE /agents/:id</code> - Delete an agent</li>
            </ul>
          </div>
          
          <p>For more information, please refer to the <a href="https://github.com/yourusername/bolna-nest/blob/main/README.md">README</a> or <a href="https://github.com/yourusername/bolna-nest/blob/main/DOCKER_SETUP.md">DOCKER_SETUP.md</a>.</p>
          
          <p><strong>Telephony Server</strong> is running on port 3001!</p>
          <p><strong>API Server</strong> is running on port 3000!</p>
        </body>
      </html>
    `;
    }
};
TelephonyServerService = __decorate([
    (0, common_1.Injectable)()
], TelephonyServerService);
let TelephonyServerController = class TelephonyServerController {
    telephonyServerService;
    constructor(telephonyServerService) {
        this.telephonyServerService = telephonyServerService;
    }
    getWelcome() {
        return this.telephonyServerService.getWelcome();
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], TelephonyServerController.prototype, "getWelcome", null);
TelephonyServerController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [TelephonyServerService])
], TelephonyServerController);
const common_2 = require("@nestjs/common");
let TelephonyServerModule = class TelephonyServerModule {
};
TelephonyServerModule = __decorate([
    (0, common_2.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            redis_module_1.RedisModule,
            websocket_module_1.WebsocketModule,
            agent_module_1.AgentModule,
            asr_module_1.AsrModule,
            llm_module_1.LlmModule,
            tts_module_1.TtsModule,
            telephony_module_1.TelephonyModule,
        ],
        controllers: [TelephonyServerController],
        providers: [TelephonyServerService],
    })
], TelephonyServerModule);
async function bootstrap() {
    const logger = new common_1.Logger('TelephonyBootstrap');
    const app = await core_1.NestFactory.create(TelephonyServerModule);
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.enableCors();
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`Telephony server is running on: http://localhost:${port}`);
    logger.log('Telephony server is ready to handle calls');
}
bootstrap();
//# sourceMappingURL=telephony.js.map