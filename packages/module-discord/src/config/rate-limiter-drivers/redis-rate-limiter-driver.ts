import type { Application } from '@framework/core/app';
import type { RedisClientType } from 'redis';
import type { RateLimiterDriverInterface } from '#src/config/types';
import type { RateLimiterInterface } from '#src/connection/types';

export interface RedisRateLimiterDriverConfig {
  maxConcurrency: number;
  timeout: number;
  channel: string;
  database: number;
}

export default class RedisRateLimiterDriver implements RateLimiterDriverInterface {
  public constructor(
    protected readonly _config: RedisRateLimiterDriverConfig,
  ) { }

  public async create(app: Application): Promise<RateLimiterInterface> {
    const { default: RedisRateLimiter } = await import('#src/connection/rate-limiters/redis-rate-limiter');
    const redis: RedisClientType = await app.container.make('redis.client');

    const rateLimitRedis = redis.duplicate({
      database: this._config.database,
    });

    return new RedisRateLimiter(rateLimitRedis, this._config.maxConcurrency, this._config.timeout, this._config.channel);
  }
}
