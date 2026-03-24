import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis;

  constructor(private _configService: ConfigService) {}

  async onModuleInit() {
    this.redis = new Redis({
      host: this._configService.get<string>('redis.host'),
      port: this._configService.get<number>('redis.port'),
      password: this._configService.get<string>('redis.password'),
      db: this._configService.get<number>('redis.db'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Failed to get cache key ${key}: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Failed to set cache key ${key}: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${key}: ${error.message}`);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete cache pattern ${pattern}: ${error.message}`,
      );
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check cache key ${key}: ${error.message}`);
      return false;
    }
  }

  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const value = await this.redis.incr(key);
      if (ttl && value === 1) {
        await this.redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      this.logger.error(
        `Failed to increment cache key ${key}: ${error.message}`,
      );
      return 0;
    }
  }

  // Cache helpers for specific use cases
  async cacheEvent(
    eventPda: string,
    event: any,
    ttl: number = 60,
  ): Promise<void> {
    await this.set(`event:${eventPda}`, event, ttl);
  }

  async getCachedEvent(eventPda: string): Promise<any> {
    return await this.get(`event:${eventPda}`);
  }

  async invalidateEvent(eventPda: string): Promise<void> {
    await this.del(`event:${eventPda}`);
  }

  async cacheUser(
    walletAddress: string,
    user: any,
    ttl: number = 300,
  ): Promise<void> {
    await this.set(`user:${walletAddress}`, user, ttl);
  }

  async getCachedUser(walletAddress: string): Promise<any> {
    return await this.get(`user:${walletAddress}`);
  }

  async invalidateUser(walletAddress: string): Promise<void> {
    await this.del(`user:${walletAddress}`);
  }

  async cacheTVL(tvl: any, ttl: number = 300): Promise<void> {
    await this.set('protocol:tvl', tvl, ttl);
  }

  async getCachedTVL(): Promise<any> {
    return await this.get('protocol:tvl');
  }
}
