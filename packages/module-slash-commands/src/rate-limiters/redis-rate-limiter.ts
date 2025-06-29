import type { Result } from '@framework/core/vendors/neverthrow';
import { err, fromPromise, ok } from '@framework/core/vendors/neverthrow';
import type { Snowflake } from '@module/discord/vendors/discordjs';
import { RateLimiterRes, type RateLimiterRedis } from 'rate-limiter-flexible';
import type { RateLimitResponse, RateLimiterInterface } from '#src/types';

export default class RedisRateLimiter implements RateLimiterInterface {
  public constructor(
    protected readonly _redisRateLimiter: RateLimiterRedis,
  ) {
    //
  }

  public async hit(userId: Snowflake): Promise<Result<RateLimitResponse, Error>> {
    const consumeResult = await fromPromise(
      this._redisRateLimiter.consume(this._createKey(userId)),
      (e) => {
        if (e instanceof RateLimiterRes) {
          return e;
        }

        return new Error(`Unknown error occurred while hitting rate limit for user ${userId}: ${String(e)}`, { cause: e });
      },
    ).orElse((e) => e instanceof RateLimiterRes ? ok(e) : err(e));

    if (consumeResult.isErr()) {
      return err(consumeResult.error);
    }

    return ok({
      isFirst: consumeResult.value.isFirstInDuration,
      remaining: consumeResult.value.remainingPoints,
      resetInMs: consumeResult.value.msBeforeNext,
    });
  }

  protected _createKey(userId: Snowflake): string {
    return `discord:slash-commands:rate-limit:${userId}`;
  }
}
