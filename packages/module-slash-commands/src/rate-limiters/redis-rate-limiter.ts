import type { Snowflake } from '@module/discord/vendors/discordjs';
import { RateLimiterRes } from 'rate-limiter-flexible';
import type { RateLimiterRedis } from 'rate-limiter-flexible';
import type { RateLimitResponse, RateLimiterInterface } from '#src/types';

export default class RedisRateLimiter implements RateLimiterInterface {
  public constructor(
    protected readonly _redisRateLimiter: RateLimiterRedis,
  ) {
    //
  }

  public async hit(userId: Snowflake): Promise<RateLimitResponse> {
    const rateLimitResult = await this._consume(userId);

    return {
      isFirst: rateLimitResult.isFirstInDuration,
      remaining: rateLimitResult.remainingPoints,
      resetInMs: rateLimitResult.msBeforeNext,
    };
  }

  protected async _consume(userId: Snowflake): Promise<RateLimiterRes> {
    try {
      return await this._redisRateLimiter.consume(this._createKey(userId));
    } catch (e) {
      if (e instanceof RateLimiterRes) {
        return e;
      }

      throw e;
    }
  }

  protected _createKey(userId: Snowflake): string {
    return `discord:slash-commands:rate-limit:${userId}`;
  }
}
