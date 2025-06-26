import { safeJsonParse } from '@framework/core';
import type { LoggerInterface } from '@module/logger';
import { err, fromPromise, ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { createClient } from 'redis';
import { z } from 'zod/v4';
import type EventManager from '#/event-manager';
import { InvalidEventHandlerFormatException } from '#/exceptions';

export class EventRouter {
  public constructor(
    protected readonly _redis: ReturnType<typeof createClient>,
    protected readonly _events: EventManager,
    protected readonly _logger: LoggerInterface,
  ) { }

  public async unsubscribe(channelName: string): Promise<void> {
    this._logger.debug('Unsubscribing from Redis events channel');

    if (! this._redis.isOpen) {
      this._logger.warn('Redis client is not connected, skipping disconnection step');
      return;
    }

    await this._redis.unsubscribe(channelName);
    await this._redis.disconnect();

    this._logger.info(`Unsubscribed from Redis events channel '${channelName}'`);
  }

  public async subscribe(channelName: string): Promise<void> {
    this._logger.debug('Subscribing to Redis events channel');

    if (this._redis.isOpen) {
      this._logger.warn('Redis client is already connected, skipping connection step');
      return;
    }

    const connectResult = await fromPromise(this._redis.connect(), (e) => e instanceof Error ? e : new Error('Unknown error while connecting to Redis'));
    if (connectResult.isErr()) {
      this._logger.error(connectResult.error);
    }

    await this._redis.subscribe(channelName, (message) => this.handle(message));
    this._logger.info(`Subscribed to Redis events channel '${channelName}'`);
  }

  public async handle(message: string): Promise<Result<void, Error>> {
    if (! message || typeof message !== 'string') {
      this._logger.debug('Received message is not a valid string');
      return err(new InvalidEventHandlerFormatException('Event should be a valid JSON string'));
    }

    const parseResult = safeJsonParse(message);

    if (parseResult.isErr()) {
      this._logger.debug('Received event is not a valid JSON string');
      return err(new InvalidEventHandlerFormatException(parseResult.error.message));
    }

    const redisCommandRaw = z.object({
      event: z.string(),
      guildId: z.string(),
      args: z.record(z.string(), z.any()).default({}),
    }).safeParse(parseResult.value);

    if (! redisCommandRaw.success) {
      this._logger.debug('Invalid action payload');
      return err(new InvalidEventHandlerFormatException('Invalid action payload'));
    }

    const executeResult = await this._events.execute(redisCommandRaw.data.event, redisCommandRaw.data.guildId, redisCommandRaw.data.args);
    if (executeResult.isErr()) {
      this._logger.debug(executeResult.error.message);
      return executeResult;
    }

    return ok();
  }
}
