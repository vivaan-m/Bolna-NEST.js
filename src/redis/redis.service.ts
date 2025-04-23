import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);
  private connectionRetries = 0;
  private readonly maxRetries = 5;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    
    this.logger.log(`Connecting to Redis at ${redisHost}:${redisPort}`);
    
    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      retryStrategy: (times) => {
        this.connectionRetries = times;
        if (times > this.maxRetries) {
          this.logger.error(`Failed to connect to Redis after ${times} attempts. Giving up.`);
          return null; // Stop retrying
        }
        
        const delay = Math.min(times * 1000, 5000);
        this.logger.warn(`Redis connection attempt ${times} failed. Retrying in ${delay}ms...`);
        return delay;
      },
    });
    
    this.redisClient.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });
    
    this.redisClient.on('error', (err) => {
      this.logger.error(`Redis error: ${err.message}`);
    });
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.logger.log('Disconnecting from Redis');
      this.redisClient.disconnect();
    }
  }

  async set(key: string, value: any, expiry?: number): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    if (expiry) {
      await this.redisClient.set(key, stringValue, 'EX', expiry);
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  async get(key: string): Promise<any> {
    const value = await this.redisClient.get(key);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }
  
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.sadd(key, ...members);
  }
  
  async srem(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.srem(key, ...members);
  }
  
  async smembers(key: string): Promise<string[]> {
    return this.redisClient.smembers(key);
  }
  
  async keys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }
  
  async flushall(): Promise<void> {
    await this.redisClient.flushall();
  }
}