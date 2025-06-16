import type { RedisCommandInterface } from '@module/redis-commands';
import type { Client } from 'discord.js';
import type { Result } from 'neverthrow';
import { err, errAsync, fromPromise, ok } from 'neverthrow';
import { z } from 'zod/v4';

// Just a example command
export interface PingUserRedisCommandArgs {
  userId: string;
}

export default class PingUserRedisCommand implements RedisCommandInterface<PingUserRedisCommandArgs> {
  static containerInjections = {
    _constructor: {
      dependencies: ['discord.client'],
    },
  };

  public readonly name: string = 'ping-user';

  public constructor(protected readonly _discord: Client) { }

  public async execute(args: PingUserRedisCommandArgs): Promise<Result<void, Error>> {
    const { userId } = args;

    const user = await this._discord.users.fetch(userId);

    if (! user) {
      return errAsync(new Error(`Member with ID ${userId} not found.`));
    }

    return fromPromise(user.send({
      content: `Pong! Your ID is ${userId}`,
    }).then(void 0), () => new Error(`Failed to send message to user ${userId}`));
  }

  public validate(rawArgs: unknown): Result<PingUserRedisCommandArgs, Error> {
    const res = z.object({
      message: z.string(),
      userId: z.string(),
    }).safeParse(rawArgs);

    return res.success ? ok(res.data) : err(res.error);
  }
}
