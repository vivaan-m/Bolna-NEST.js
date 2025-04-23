import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private redisClient;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    set(key: string, value: any, expiry?: number): Promise<void>;
    get(key: string): Promise<any>;
    delete(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
