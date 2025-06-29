import { err, fromPromise, ok } from '@framework/core/vendors/neverthrow';
import type { Result } from '@framework/core/vendors/neverthrow';
import type { LoggerInterface } from '@module/logger';
import type { Client } from 'discord.js';
import { debug } from '#root/debug';
import { DiscordConnectionException } from '#src/connection/exceptions';
import type { RateLimiterInterface } from '#src/connection/types';

export default class Connector {
  public constructor(
    protected readonly _discord: Client,
    protected readonly _rateLimiter: RateLimiterInterface,
    protected readonly _logger: LoggerInterface,
    protected readonly _token: string,
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

    return this._tryConnect(this._token);
  }

  protected async _tryConnect(token: string): Promise<Result<void, Error>> {
    const consumeResult = await this._rateLimiter.consume();
    if (consumeResult.isErr()) {
      debug(`Discord rate limiter error: ${consumeResult.error.message}`);
      return err(consumeResult.error);
    }

    if (! consumeResult.value.isFirst && consumeResult.value.remaining <= 0) {
      debug('Rate limit window reset, retrying connection...');
      this._logger.warn(`Rate limit exceeded, retrying connection in ${consumeResult.value.resetInMs}ms`);

      await new Promise(r => setTimeout(r, consumeResult.value.resetInMs));
      return this._tryConnect(token);
    }

    return this._loginToDiscord(token);
  }

  protected async _loginToDiscord(token: string): Promise<Result<void, Error>> {
    const loginResult = await fromPromise(this._discord.login(token), (e) => {
      return new DiscordConnectionException(e);
    });

    return loginResult.isErr() ? err(loginResult.error) : ok();
  }
}
