import { RateLimiterRes } from 'rate-limiter-flexible';
import type { RateLimiterRedis } from 'rate-limiter-flexible';
import type { RateLimiterInterface, RateLimitResponse } from '#src/connection/types';

export default class RedisRateLimiter implements RateLimiterInterface {
  public constructor(
    protected readonly _redisRateLimiter: RateLimiterRedis,
  ) {
    //
  }

  public async consume(): Promise<RateLimitResponse> {
    const consume = await this._consume();

    return {
      isFirst: consume.isFirstInDuration,
      remaining: consume.remainingPoints,
      resetInMs: consume.msBeforeNext,
    };
  }

  protected async _consume(): Promise<RateLimiterRes> {
    try {
      return await this._redisRateLimiter.consume('discord:connection:rate-limiter');
    } catch (e) {
      if (e instanceof RateLimiterRes) {
        return e;
      }

      throw e;
    }
  }
}
