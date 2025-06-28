import type { ErrorHandler } from '@framework/core/app';
import type { LoggerInterface } from '@module/logger';
import type { Client } from 'discord.js';

export default class Handler {
  public constructor(
    protected readonly _errorHandler: ErrorHandler,
    protected readonly _logger: LoggerInterface,
  ) { }

  public debug(message: string): void {
    this._logger.debug(message);
  }

  public error(error: Error): void {
    this._errorHandler.handle(error);
  }

  public async clientReady(client: Client<true>): Promise<void> {
    this._logger.info(`Discord client is ready as ${client.user.tag}`);
  }
}
