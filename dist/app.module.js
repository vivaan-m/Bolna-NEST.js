"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const agent_module_1 = require("./agent/agent.module");
const agent_manager_module_1 = require("./agent/manager/agent-manager.module");
const telephony_module_1 = require("./telephony/telephony.module");
const asr_module_1 = require("./asr/asr.module");
const llm_module_1 = require("./llm/llm.module");
const tts_module_1 = require("./tts/tts.module");
const websocket_module_1 = require("./websocket/websocket.module");
const redis_module_1 = require("./redis/redis.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            redis_module_1.RedisModule,
            agent_module_1.AgentModule,
            agent_manager_module_1.AgentManagerModule,
            telephony_module_1.TelephonyModule,
            asr_module_1.AsrModule,
            llm_module_1.LlmModule,
            tts_module_1.TtsModule,
            websocket_module_1.WebsocketModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map