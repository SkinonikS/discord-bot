import type { Application } from '@framework/core/app';
import type { Manager } from '@module/redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import type { RateLimiterDriverInterface, RateLimiterGlobalConfig } from '#src/config/types';
import type { RateLimiterInterface } from '#src/types';

export interface RedisRateLimiterDriverConfig {
  client: string;
}

export default class RedisRateLimiterDriver implements RateLimiterDriverInterface {
  public constructor(
    protected readonly _config: RedisRateLimiterDriverConfig,
  ) { }

  public async create(app: Application, config: RateLimiterGlobalConfig): Promise<RateLimiterInterface> {
    const { default: RedisRateLimiter } = await import('#src/rate-limiters/redis-rate-limiter');
    const redisManager: Manager = await app.container.make('redis');
    const redis = redisManager.client(this._config.client);

    return new RedisRateLimiter(new RateLimiterRedis({
      storeClient: redis,
      points: config.points,
      duration: config.durationMs / 1000,
      keyPrefix: '',
    }));
  }
}
