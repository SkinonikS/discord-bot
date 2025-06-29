import type { Application } from '@framework/core/app';
import type { Manager } from '@module/redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import type { RateLimiterDriverInterface, RateLimiterGlobalConfig } from '#src/config/types';
import type { RateLimiterInterface } from '#src/connection/types';

export interface RedisRateLimiterDriverConfig {
  client: string;
}

export default class RedisRateLimiterDriver implements RateLimiterDriverInterface {
  public constructor(
    protected readonly _config: RedisRateLimiterDriverConfig,
  ) { }

  public async create(app: Application, config: RateLimiterGlobalConfig): Promise<RateLimiterInterface> {
    const { default: RedisRateLimiter } = await import('#src/connection/rate-limiters/redis-rate-limiter');
    const redisManager: Manager = await app.container.make('redis');
    const redis = redisManager.client(this._config.client);
    if (redis.isErr()) {
      throw redis.error;
    }

    const rateLimiter = new RateLimiterRedis({
      storeClient: redis.value,
      points: config.points,
      duration: config.durationMs / 1000,
      keyPrefix: '',
    });

    return new RedisRateLimiter(rateLimiter);
  }
}
