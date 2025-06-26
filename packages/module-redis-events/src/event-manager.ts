import { importModule, ImportNotFoundException, instantiateIfNeeded } from '@framework/core';
import type { Application } from '@framework/core';
import type { LoggerInterface } from '@module/logger';
import type { Client, Snowflake } from 'discord.js';
import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import { EventHandlerNotFoundException, InvalidEventHandlerArgumentsException } from './exceptions';
import type { EventHandlerInterface, EventHandlerResolver } from '#/types';

export default class EventManager {
  protected readonly _eventHandlers = new Map<string, EventHandlerInterface>();

  public constructor(
    protected readonly _app: Application,
    protected readonly _discord: Client,
    protected readonly _logger: LoggerInterface,
  ) { }

  public async register(eventHandlers: EventHandlerResolver[]): Promise<void> {
    for (const eventHandlerResolver of eventHandlers) {
      try {
        const resolvedEventHandler = await importModule(() => eventHandlerResolver());
        const eventHandler = await instantiateIfNeeded(resolvedEventHandler, this._app);

        this._eventHandlers.set(eventHandler.name, eventHandler);
        this._logger.debug(`Registered event handler: ${eventHandler.name}`);
      } catch (e) {
        if (e instanceof ImportNotFoundException) {
          this._logger.error(e as ImportNotFoundException);
          continue;
        }

        throw e;
      }
    }
  }

  public async execute(eventHandlerName: string, guildId: Snowflake, args: unknown): Promise<Result<void, Error>> {
    if (! this._discord.guilds.cache.has(guildId)) {
      return ok();
    }

    const eventHandler = this._eventHandlers.get(eventHandlerName);

    if (! eventHandler) {
      this._logger.debug(`Event handler not found: ${eventHandlerName}`);
      return err(new EventHandlerNotFoundException(eventHandlerName));
    }

    const validationResult = eventHandler.validate(args);

    if (validationResult.isErr()) {
      this._logger.debug(`Invalid arguments for event handler: ${eventHandlerName}`);
      return err(new InvalidEventHandlerArgumentsException(eventHandlerName));
    }

    return eventHandler.execute(guildId, args);
  }
}
