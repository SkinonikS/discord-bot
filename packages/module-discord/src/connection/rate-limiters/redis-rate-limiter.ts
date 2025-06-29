import type { Result } from '@framework/core/vendors/neverthrow';
import { ok, err, fromPromise } from '@framework/core/vendors/neverthrow';
import { RateLimiterRes, type RateLimiterRedis } from 'rate-limiter-flexible';
import type { RateLimiterInterface, RateLimitResponse } from '#src/connection/types';

export default class RedisRateLimiter implements RateLimiterInterface {
  public constructor(
    protected readonly _redisRateLimiter: RateLimiterRedis,
  ) {
    //
  }

  public async consume(): Promise<Result<RateLimitResponse, Error>> {
    const consumeResult = await fromPromise(
      this._redisRateLimiter.consume('discord:connection:rate-limiter'),
      (e) => {
        if (e instanceof RateLimiterRes) {
          return e;
        }

        return new Error(`Unknown error occurred while hitting rate limit: ${String(e)}`, { cause: e });
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
}
