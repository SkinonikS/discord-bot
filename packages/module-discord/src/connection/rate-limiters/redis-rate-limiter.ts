import type { Result } from 'neverthrow';
import { ok, err, fromPromise } from 'neverthrow';
import { RateLimiterRes, type RateLimiterRedis } from 'rate-limiter-flexible';
import type { RedisClientType } from 'redis';
import type { RateLimiterInterface, RateLimitResponse } from '#src/connection/types';

export default class RedisRateLimiter implements RateLimiterInterface {
  public constructor(
    protected readonly _redis: RedisClientType,
    protected readonly _redisRateLimiter: RateLimiterRedis,
  ) {
    //
  }

  public async setup(): Promise<Result<void, Error>> {
    const connectResult = await fromPromise(
      this._redis.connect(),
      (e) => e instanceof Error ? e : new Error('Unknown error occurred while connecting to Redis'),
    );

    return connectResult.isErr() ? err(connectResult.error) : ok();
  }

  public async dispose(): Promise<Result<void, Error>> {
    const disconnectResult = await fromPromise(
      this._redis.quit(),
      (e) => e instanceof Error ? e : new Error('Unknown error occurred while disconnecting from Redis'),
    );

    return disconnectResult.isErr() ? err(disconnectResult.error) : ok();
  }

  public get available(): boolean {
    return this._redis.isOpen;
  }

  public async consume(): Promise<Result<RateLimitResponse, Error>> {
    const consumeResult = await fromPromise(
      this._redisRateLimiter.consume('discord:connection:rate-limiter'),
      (e) => {
        if (e instanceof RateLimiterRes || e instanceof Error) {
          return e;
        }

        return new Error(`Unknown error occurred while hitting rate limit: ${String(e)}`);
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
