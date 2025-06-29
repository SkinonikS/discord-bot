import type { Application } from '@framework/core/app';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import type { RedisClientType } from 'redis';
import type { RateLimiterDriverInterface, RateLimiterGlobalConfig } from '#src/config/types';
import type { RateLimiterInterface } from '#src/connection/types';

export interface RedisRateLimiterDriverConfig {
  database: number;
}

export default class RedisRateLimiterDriver implements RateLimiterDriverInterface {
  public constructor(
    protected readonly _config: RedisRateLimiterDriverConfig,
  ) { }

  public async create(app: Application, config: RateLimiterGlobalConfig): Promise<RateLimiterInterface> {
    const { default: RedisRateLimiter } = await import('#src/connection/rate-limiters/redis-rate-limiter');
    const redis: RedisClientType = await app.container.make('redis.client');

    const rateLimitRedis = redis.duplicate({
      database: this._config.database,
    });

    const rateLimiter = new RateLimiterRedis({
      storeClient: rateLimitRedis,
      points: config.points,
      duration: config.durationMs / 1000,
      keyPrefix: '',
    });

    return new RedisRateLimiter(rateLimitRedis, rateLimiter);
  }
}
