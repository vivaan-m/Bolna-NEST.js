"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManagerModule = void 0;
const common_1 = require("@nestjs/common");
const agent_manager_service_1 = require("./agent-manager.service");
const agent_module_1 = require("../agent.module");
const memory_module_1 = require("../memory/memory.module");
const task_module_1 = require("../task.module");
const llm_module_1 = require("../../llm/llm.module");
const asr_module_1 = require("../../asr/asr.module");
const tts_module_1 = require("../../tts/tts.module");
let AgentManagerModule = class AgentManagerModule {
};
exports.AgentManagerModule = AgentManagerModule;
exports.AgentManagerModule = AgentManagerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => agent_module_1.AgentModule),
            memory_module_1.MemoryModule,
            task_module_1.TaskModule,
            llm_module_1.LlmModule,
            asr_module_1.AsrModule,
            tts_module_1.TtsModule,
        ],
        providers: [agent_manager_service_1.AgentManagerService],
        exports: [agent_manager_service_1.AgentManagerService],
    })
], AgentManagerModule);
//# sourceMappingURL=agent-manager.module.js.map