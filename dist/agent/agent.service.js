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
var AgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const uuid_1 = require("uuid");
let AgentService = AgentService_1 = class AgentService {
    redisService;
    logger = new common_1.Logger(AgentService_1.name);
    constructor(redisService) {
        this.redisService = redisService;
    }
    async createAgent(config) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const agent = {
            id,
            config,
            createdAt: now,
            updatedAt: now,
        };
        await this.redisService.set(`agent:${id}`, agent);
        this.logger.log(`Created agent with ID: ${id}`);
        return agent;
    }
    async getAgent(id) {
        return this.redisService.get(`agent:${id}`);
    }
    async updateAgent(id, config) {
        const agent = await this.getAgent(id);
        if (!agent) {
            return null;
        }
        const updatedAgent = {
            ...agent,
            config: {
                ...agent.config,
                ...config,
            },
            updatedAt: new Date(),
        };
        await this.redisService.set(`agent:${id}`, updatedAgent);
        this.logger.log(`Updated agent with ID: ${id}`);
        return updatedAgent;
    }
    async deleteAgent(id) {
        const exists = await this.redisService.exists(`agent:${id}`);
        if (!exists) {
            return false;
        }
        await this.redisService.delete(`agent:${id}`);
        this.logger.log(`Deleted agent with ID: ${id}`);
        return true;
    }
    async listAgents() {
        return [];
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], AgentService);
//# sourceMappingURL=agent.service.js.map