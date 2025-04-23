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
var MemoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../redis/redis.service");
const fs = require("fs");
const path = require("path");
let MemoryService = MemoryService_1 = class MemoryService {
    redisService;
    logger = new common_1.Logger(MemoryService_1.name);
    memoryDir = path.join(process.cwd(), 'agent_data');
    constructor(redisService) {
        this.redisService = redisService;
        if (!fs.existsSync(this.memoryDir)) {
            fs.mkdirSync(this.memoryDir, { recursive: true });
        }
    }
    async addMessage(agentId, message, config) {
        try {
            if (config.type === 'short_term' || config.type === 'both') {
                await this.addToShortTermMemory(agentId, message, config);
            }
            if (config.type === 'long_term' || config.type === 'both') {
                await this.addToLongTermMemory(agentId, message, config);
            }
        }
        catch (error) {
            this.logger.error(`Error adding message to memory for agent ${agentId}: ${error.message}`);
            throw error;
        }
    }
    async getMessages(agentId, config) {
        try {
            if (config.type === 'short_term') {
                return this.getShortTermMemory(agentId, config);
            }
            else if (config.type === 'long_term') {
                return this.getLongTermMemory(agentId, config);
            }
            else if (config.type === 'both') {
                const shortTermMessages = await this.getShortTermMemory(agentId, config);
                const longTermMessages = await this.getLongTermMemory(agentId, config);
                const longTermIds = new Set(shortTermMessages.map(msg => this.getMessageId(msg)));
                const filteredLongTerm = longTermMessages.filter(msg => !longTermIds.has(this.getMessageId(msg)));
                return [...shortTermMessages, ...filteredLongTerm];
            }
            return [];
        }
        catch (error) {
            this.logger.error(`Error getting messages from memory for agent ${agentId}: ${error.message}`);
            throw error;
        }
    }
    async clearMemory(agentId, config) {
        try {
            if (config.type === 'short_term' || config.type === 'both') {
                await this.clearShortTermMemory(agentId);
            }
            if (config.type === 'long_term' || config.type === 'both') {
                await this.clearLongTermMemory(agentId);
            }
        }
        catch (error) {
            this.logger.error(`Error clearing memory for agent ${agentId}: ${error.message}`);
            throw error;
        }
    }
    async addToShortTermMemory(agentId, message, config) {
        const key = `agent:${agentId}:memory:short_term`;
        const existingMessages = await this.redisService.get(key) || [];
        existingMessages.push({
            ...message,
            timestamp: new Date().toISOString(),
        });
        if (config.max_messages && existingMessages.length > config.max_messages) {
            existingMessages.splice(0, existingMessages.length - config.max_messages);
        }
        await this.redisService.set(key, existingMessages);
    }
    async getShortTermMemory(agentId, config) {
        const key = `agent:${agentId}:memory:short_term`;
        const messages = await this.redisService.get(key) || [];
        if (config.max_messages && messages.length > config.max_messages) {
            return messages.slice(messages.length - config.max_messages);
        }
        return messages;
    }
    async clearShortTermMemory(agentId) {
        const key = `agent:${agentId}:memory:short_term`;
        await this.redisService.delete(key);
    }
    async addToLongTermMemory(agentId, message, config) {
        const agentDir = path.join(this.memoryDir, agentId);
        if (!fs.existsSync(agentDir)) {
            fs.mkdirSync(agentDir, { recursive: true });
        }
        const memoryFile = path.join(agentDir, 'long_term_memory.json');
        let existingMessages = [];
        if (fs.existsSync(memoryFile)) {
            try {
                const data = fs.readFileSync(memoryFile, 'utf8');
                existingMessages = JSON.parse(data);
            }
            catch (error) {
                this.logger.error(`Error reading long-term memory file for agent ${agentId}: ${error.message}`);
            }
        }
        existingMessages.push({
            ...message,
            timestamp: new Date().toISOString(),
        });
        fs.writeFileSync(memoryFile, JSON.stringify(existingMessages, null, 2));
    }
    async getLongTermMemory(agentId, config) {
        const memoryFile = path.join(this.memoryDir, agentId, 'long_term_memory.json');
        if (!fs.existsSync(memoryFile)) {
            return [];
        }
        try {
            const data = fs.readFileSync(memoryFile, 'utf8');
            const messages = JSON.parse(data);
            if (config.max_messages && messages.length > config.max_messages) {
                return messages.slice(messages.length - config.max_messages);
            }
            return messages;
        }
        catch (error) {
            this.logger.error(`Error reading long-term memory file for agent ${agentId}: ${error.message}`);
            return [];
        }
    }
    async clearLongTermMemory(agentId) {
        const memoryFile = path.join(this.memoryDir, agentId, 'long_term_memory.json');
        if (fs.existsSync(memoryFile)) {
            fs.unlinkSync(memoryFile);
        }
    }
    getMessageId(message) {
        return `${message.role}:${message.content}:${message.timestamp || ''}`;
    }
};
exports.MemoryService = MemoryService;
exports.MemoryService = MemoryService = MemoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], MemoryService);
//# sourceMappingURL=memory.service.js.map