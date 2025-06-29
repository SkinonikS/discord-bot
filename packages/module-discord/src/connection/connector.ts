import type { LoggerInterface } from '@module/logger';
import type { Client } from 'discord.js';
import type { Result } from 'neverthrow';
import { err, fromPromise, ok } from 'neverthrow';
import { debug } from '#root/debug';
import type { RateLimiterInterface } from '#src/connection/types';

export default class Connector {
  public constructor(
    protected readonly _discord: Client,
    protected readonly _rateLimiter: RateLimiterInterface,
    protected readonly _logger: LoggerInterface,
    protected readonly _token: string,
    protected readonly _reconnectionTimeout: number = 1000,
  ) {
    //
  }

  public async disconnect(): Promise<Result<void, Error>> {
    debug('Disconnecting Discord client...');

    if (! this._discord.isReady()) {
      return ok();
    }

    return fromPromise(
      this._discord.destroy(),
      (e) => e instanceof Error ? e : new Error('Unknown error'),
    );
  }

  public async connect(): Promise<Result<void, Error>> {
    debug('Connecting to Discord...');

    if (this._discord.isReady()) {
      debug('Discord client is already connected, skipping connection attempt');
      return ok();
    }

    const setupResult = await this._rateLimiter.setup();
    if (setupResult.isErr() || ! this._rateLimiter.available) {
      debug('Failed to open rate limiter, cannot connect to Discord');
      this._logger.warn('Failed to open rate limiter. Skipping rate limiting.');
      return this._loginToDiscord();
    }

    return this._tryConnect().then(async (connectResult) => {
      if (connectResult.isErr()) {
        this._logger.error(connectResult.error);
        setTimeout(() => this._tryConnect(), this._reconnectionTimeout);
        return ok();
      } else {
        return this._rateLimiter.dispose();
      }
    });
  }

  protected async _tryConnect(): Promise<Result<void, Error>> {
    const consumeResult = await this._rateLimiter.consume();
    if (consumeResult.isErr()) {
      debug(`Discord hit the rate limit, waiting ${this._reconnectionTimeout} before retrying...`);
      return err(new Error(`Discord hit the gateway rate limit, waiting ${this._reconnectionTimeout}ms before retrying...`));
    }

    if (! consumeResult.value.isFirst && consumeResult.value.remaining <= 0) {
      debug(`Discord hit the rate limit, waiting ${consumeResult.value.resetInMs}ms before retrying...`);
      return err(new Error(`Discord hit the gateway rate limit, waiting ${consumeResult.value.resetInMs}ms before retrying...`));
    }

    const loginResult = await this._loginToDiscord();
    if (loginResult.isErr()) {
      debug('Discord login failed, waiting before retrying...');
      return err(new Error(`Discord login failed: ${loginResult.error}`));
    }

    debug('Discord client connected successfully');
    return ok();
  }

  protected async _loginToDiscord(): Promise<Result<void, Error>> {
    const loginResult = await fromPromise(
      this._discord.login(this._token),
      (e) => e instanceof Error ? e : new Error('Unknown error'),
    );

    return loginResult.isErr() ? err(loginResult.error) : ok();
  }
}
