import type { Application } from '@framework/core';
import type {  Result } from 'neverthrow';
import { errAsync } from 'neverthrow';
import type { RedisCommandInterface, RedisCommandLoaderInterface } from '#/types';

export default class RedisCommandManager {
  protected readonly _commands = new Map<string, RedisCommandInterface>();

  public constructor(protected readonly _app: Application) { }

  public async register(redisCommand: RedisCommandLoaderInterface): Promise<void> {
    const commands = await redisCommand.load(this._app);

    for (const command of commands) {
      this._commands.set(command.name, command);
    }
  }

  public async execute(commandName: string, args: Record<string, unknown>): Promise<Result<void, Error>> {
    const command = this._commands.get(commandName);

    if (! command) {
      return errAsync(new Error(`Unknown command: ${commandName}`));
    }

    const validationResult = command.validate(args);

    if (validationResult.isErr()) {
      return errAsync(new Error('Invalid command arguments'));
    }

    return command.execute(validationResult.value);
  }
}
