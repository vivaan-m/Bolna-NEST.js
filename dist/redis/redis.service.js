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
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = class RedisService {
    configService;
    redisClient;
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        const redisHost = this.configService.get('REDIS_HOST', 'localhost');
        const redisPort = this.configService.get('REDIS_PORT', 6379);
        this.redisClient = new ioredis_1.default({
            host: redisHost,
            port: redisPort,
        });
    }
    onModuleDestroy() {
        if (this.redisClient) {
            this.redisClient.disconnect();
        }
    }
    async set(key, value, expiry) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        if (expiry) {
            await this.redisClient.set(key, stringValue, 'EX', expiry);
        }
        else {
            await this.redisClient.set(key, stringValue);
        }
    }
    async get(key) {
        const value = await this.redisClient.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch (e) {
            return value;
        }
    }
    async delete(key) {
        await this.redisClient.del(key);
    }
    async exists(key) {
        const result = await this.redisClient.exists(key);
        return result === 1;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map