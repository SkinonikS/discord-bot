import { importModule, ImportNotFoundException, instantiateIfNeeded } from '@framework/core';
import type { Application } from '@framework/core';
import type { LoggerInterface } from '@module/logger';
import type { Client, Snowflake } from 'discord.js';
import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import { InvalidRedisActionArgumentsError, RedisActionNotFoundException } from '#/exceptions';
import type { RedisActionInterface, RedisActionResolver } from '#/types';

export default class RedisActionManager {
  protected readonly _actions = new Map<string, RedisActionInterface>();

  public constructor(
    protected readonly _app: Application,
    protected readonly _discord: Client,
    protected readonly _logger: LoggerInterface,
  ) { }

  public async register(redisActions: RedisActionResolver[]): Promise<void> {
    for (const redisActionsResolver of redisActions) {
      try {
        const resolvedRedisAction = await importModule(() => redisActionsResolver());
        const redisAction = await instantiateIfNeeded(resolvedRedisAction, this._app);

        this._actions.set(redisAction.name, redisAction);
        this._logger.debug(`Registered action: ${redisAction.name}`);
      } catch (e) {
        if (e instanceof ImportNotFoundException) {
          this._logger.error(e as ImportNotFoundException);
          continue;
        }

        throw e;
      }
    }
  }

  public async execute(actionName: string, guildId: Snowflake, args: never): Promise<Result<void, Error>> {
    if (! this._discord.guilds.cache.has(guildId)) {
      return ok();
    }

    const action = this._actions.get(actionName);

    if (! action) {
      this._logger.debug(`Action not found: ${actionName}`);
      return err(new RedisActionNotFoundException(actionName));
    }

    const validationResult = action.validate(args);

    if (validationResult.isErr()) {
      this._logger.debug(`Invalid arguments for action: ${actionName}`);
      return err(new InvalidRedisActionArgumentsError(actionName));
    }

    return action.execute(guildId, args);
  }
}
