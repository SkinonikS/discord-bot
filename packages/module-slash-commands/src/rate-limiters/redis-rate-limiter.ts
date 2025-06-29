import { Exception } from '@poppinss/exception';
import type { Snowflake } from 'discord.js';
import type { Result } from 'neverthrow';
import { err, fromPromise, ok } from 'neverthrow';
import { RateLimiterRes, type RateLimiterRedis } from 'rate-limiter-flexible';
import type { RedisClientType } from 'redis';
import type { RateLimitResponse, RateLimiterInterface } from '#src/types';

export class RedisRateLimitHitException extends Exception {
  public static status = 429;
  public static code = 'E_REDIS_RATE_LIMIT_HIT';

  public constructor(
    public readonly userId: Snowflake,
    public readonly rateLimits: RateLimitResponse,
    cause?: Error,
  ) {
    super(`User '${userId}' has hit the rate limit.`, { cause });
  }
}

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
      (e) => e instanceof Error ? e : new Error('Unknown error occurred while setting up rate limiter'),
    );

    return connectResult.isErr() ? err(connectResult.error) : ok();
  }

  public async dispose(): Promise<Result<void, Error>> {
    const disconnectResult = await fromPromise(
      this._redis.disconnect(),
      (e) => e instanceof Error ? e : new Error('Unknown error occurred while disposing rate limiter'),
    );

    return disconnectResult.isErr() ? err(disconnectResult.error) : ok();
  }

  public async hit(userId: Snowflake): Promise<Result<RateLimitResponse, Error>> {
    const consumeResult = await fromPromise(
      this._redisRateLimiter.consume(this._createKey(userId)),
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

  protected _createKey(userId: Snowflake): string {
    return `discord:slash-commands:rate-limit:${userId}`;
  }
}
