import type { Result } from 'neverthrow';
import { ok, err, fromPromise } from 'neverthrow';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import type { RedisClientType } from 'redis';
import type { RateLimiterInterface, RateLimitResponse } from '#src/connection/types';

export default class RedisRateLimiter implements RateLimiterInterface {
  protected readonly _redisLimiter: RateLimiterRedis;

  public constructor(
    protected readonly _redis: RedisClientType,
    protected readonly _maxConcurrency: number,
    protected readonly _timeout: number,
    protected readonly _channelName: string = 'discord:connection:queue',
  ) {
    this._redisLimiter = new RateLimiterRedis({
      storeClient: this._redis,
      points: this._maxConcurrency,
      duration: this._timeout / 1000,
    });
  }

  public async open(): Promise<Result<void, Error>> {
    const connectResult = await fromPromise(
      this._redis.connect(),
      (e) => e instanceof Error ? e : new Error('Unknown error occurred while connecting to Redis'),
    );

    if (connectResult.isErr()) {
      return err(connectResult.error);
    }

    return ok();
  }

  public async dispose(): Promise<Result<void, Error>> {
    const disconnectResult = await fromPromise(
      this._redis.quit(),
      (e) => e instanceof Error ? e : new Error('Unknown error occurred while disconnecting from Redis'),
    );

    if (disconnectResult.isErr()) {
      return err(disconnectResult.error);
    }

    return ok();
  }

  public get available(): boolean {
    return this._redis.isOpen;
  }

  public async consume(): Promise<Result<RateLimitResponse, Error>> {
    const consumeResult = await fromPromise(
      this._redisLimiter.consume(this._channelName),
      (e) => e instanceof Error ? e : new Error('Unknown error'),
    );

    if (consumeResult.isErr()) {
      return err(consumeResult.error);
    }

    return ok({
      remaining: consumeResult.value.remainingPoints,
      resetIn: consumeResult.value.msBeforeNext,
    });
  }
}
