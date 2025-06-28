import type { LoggerInterface } from '@module/logger';
import type { Client } from 'discord.js';
import { fromPromise } from 'neverthrow';
import { debug } from '#root/debug';
import type { RateLimiterInterface } from '#src/connection/types';

export default class Connector {
  public constructor(
    protected readonly _discord: Client,
    protected readonly _rateLimiter: RateLimiterInterface,
    protected readonly _logger: LoggerInterface,
    protected readonly _reconnectionTimeout: number = 1000,
  ) {
    //
  }

  public async connect(token: string): Promise<void> {
    if (this._discord.isReady()) {
      debug('Discord client is already connected, skipping connection attempt');
      return;
    }

    const openResult = await this._rateLimiter.open();
    if (openResult.isErr()) {
      debug('Failed to open rate limiter, cannot connect to Discord');
      this._logger.warn('Failed to open rate limiter. Skipping rate limiting.');

      await this._discord.login(token);
      return;
    }

    if (! this._rateLimiter.available) {
      debug('Rate Limiter is not available, connecting to Discord without rate limiting');
      this._logger.warn('Rate Limiter is not available, connecting to Discord without rate limiting');

      await this._discord.login(token);
      return;
    }

    return this._tryConnect(token).then(async () => {
      await this._rateLimiter.dispose();
    });
  }

  protected async _tryConnect(token: string): Promise<void> {
    const consumeResult = await this._rateLimiter.consume();

    if (consumeResult.isErr()) {
      debug(`Discord hit the rate limit, waiting ${this._reconnectionTimeout} before retrying...`);
      this._logger.notice(`Discord hit the gateway rate limit, waiting ${this._reconnectionTimeout}ms before retrying...`);
      setTimeout(() => this._tryConnect(token), this._reconnectionTimeout);
      return;
    }

    const loginResult = await fromPromise(this._discord.login(token), (e) => e instanceof Error ? e : new Error('Unknown error'));
    if (loginResult.isErr()) {
      debug('Discord login failed, waiting 1s before retrying...');
      this._logger.error(`Discord login failed: ${loginResult.error.message}`);
      setTimeout(() => this._tryConnect(token), this._reconnectionTimeout);
      return;
    }

    debug('Discord client connected successfully');
  }
}
