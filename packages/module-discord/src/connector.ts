import type { LoggerInterface } from '@module/logger';
import type { Client } from 'discord.js';
import type { Result } from 'neverthrow';
import { fromPromise, ok, err } from 'neverthrow';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import type { createClient } from 'redis';
import { debug } from '../debug';
import type { DiscordConfig } from '#/types';

export default class Connector {
  protected readonly _redisRateLimiter: RateLimiterRedis;

  public constructor(
    protected readonly _redis: ReturnType<typeof createClient>,
    protected readonly _config: DiscordConfig,
    protected readonly _discord: Client,
    protected readonly _logger: LoggerInterface,
  ) {
    this._redisRateLimiter = this._createRedisRateLimiter();
  }

  public async connect(): Promise<void> {
    if (this._discord.isReady()) {
      debug('Discord client is already connected, skipping connection attempt');
      this._logger.notice('Discord client is already connected, skipping connection attempt');
      return;
    }

    const connectResult = await this._connectToRedis();
    if (connectResult.isErr()) {
      debug('Failed to connect to Redis:', connectResult.error);
      this._logger.warn('Filed to connect to Redis, connection lock wont be used');
      this._connectToDiscord();
      return;
    }

    this._tryConnect();
  }

  protected async _tryConnect(): Promise<void> {
    const consumeResult = await fromPromise(
      this._redisRateLimiter.consume(this._config.rateLimiter.channelName),
      (e) => e instanceof Error ? e : new Error('Unknown error'),
    );

    if (consumeResult.isErr()) {
      debug('Discord hit the rate limit, waiting 1s before retrying...');
      this._logger.notice('Discord hit the gateway rate limit, waiting 1s before retrying...');
      setTimeout(() => this._tryConnect(), 1000);
      return;
    }

    await this._connectToDiscord();
    await this._redis.disconnect();
  }

  protected async _connectToDiscord(): Promise<void> {
    debug('Discord client is logging in...');
    await this._discord.login(this._config.token);
  }

  protected _createRedisRateLimiter(): RateLimiterRedis {
    return new RateLimiterRedis({
      storeClient: this._redis,
      points: this._config.rateLimiter.maxConcurrency,
      duration: this._config.rateLimiter.resetDuration / 1000,
    });
  }

  protected async _connectToRedis(): Promise<Result<void, Error>> {
    const connectResult = await fromPromise(this._redis.connect(), (e) => e instanceof Error ? e : new Error('Unknown error'));
    if (connectResult.isErr()) {
      return err(connectResult.error);
    }

    return ok();
  }
}
