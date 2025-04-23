import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private redisClient;
    private readonly logger;
    private connectionRetries;
    private readonly maxRetries;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    set(key: string, value: any, expiry?: number): Promise<void>;
    get(key: string): Promise<any>;
    delete(key: string): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    sadd(key: string, ...members: string[]): Promise<number>;
    srem(key: string, ...members: string[]): Promise<number>;
    smembers(key: string): Promise<string[]>;
    keys(pattern: string): Promise<string[]>;
    flushall(): Promise<void>;
}
