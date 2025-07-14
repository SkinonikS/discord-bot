import { FatalErrorException, type ErrorHandler } from '@framework/core/app';
import type { LoggerInterface } from '@module/logger';
import { ClientClosedError } from '@module/redis/vendors/redis';
import type { Client } from 'discord.js';
import type { RateLimiterInterface } from '#src/connection/types';

export default class Connector {
  public constructor(
    protected readonly _discord: Client,
    protected readonly _rateLimiter: RateLimiterInterface,
    protected readonly _logger: LoggerInterface,
    protected readonly _errorHandler: ErrorHandler,
    protected readonly _token: string,
  ) {
    //
  }

  public async disconnect(): Promise<void> {
    if (! this._discord.isReady()) {
      return;
    }

    await this._discord.destroy();
    this._logger.info('Successfully disconnected from Discord');
  }

  public async connect(): Promise<void> {
    if (this._discord.isReady()) {
      return;
    }

    this._logger.debug('Initiating connection to Discord');
    return this._tryConnect(this._token);
  }

  protected async _tryConnect(token: string): Promise<void> {
    let rateLimit;
    try {
      rateLimit = await this._rateLimiter.consume();
    } catch (e) {
      if (e instanceof ClientClosedError) {
        throw new FatalErrorException('Failed to consume rate-limiter', { cause: e });
      }

      throw e;
    }

    if (! rateLimit.isFirst && rateLimit.remaining <= 0) {
      this._logger.warn(`Rate limit exceeded, retrying connection in ${rateLimit.resetInMs}ms`);
      await new Promise(r => setTimeout(r, rateLimit.resetInMs));
      return this._tryConnect(token);
    }

    await this._discord.login(token);
  }
}
