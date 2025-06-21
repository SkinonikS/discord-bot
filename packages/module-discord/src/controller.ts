import type { ErrorHandler } from '@framework/core';
import type { LoggerInterface } from '@module/logger';
import type { Client } from 'discord.js';

export default class Controller {
  public constructor(
    protected readonly _logger: LoggerInterface,
    protected readonly _errorHandler: ErrorHandler,
  ) { }

  public debug(message: string): void {
    this._logger.debug(message);
  }

  public error(error: Error): void {
    this._errorHandler.handle(error);
  }

  public shardReady(shardId: number): void {
    this._logger.info(`Shard ${shardId} is ready`);
  }

  public shardReconnecting(shardId: number): void {
    this._logger.info(`Shard ${shardId} is reconnecting`);
  }

  public shardResume(shardId: number, replayedEvents: number): void {
    this._logger.info(`Shard ${shardId} resumed with ${replayedEvents} events replayed`);
  }

  public shardDisconnect(event: { code: number; reason: string }, shardId: number): void {
    this._logger.warn(`Shard ${shardId} disconnected: ${event.code} - ${event.reason}`);
  }

  public clientReady(client: Client<true>): void {
    this._logger.info(`Discord client is ready as ${client.user.tag}`);
  }
}
