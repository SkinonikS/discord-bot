import type { RedisActionInterface } from '@module/redis-actions';
import type { Client, Snowflake } from 'discord.js';
import type { Result } from 'neverthrow';
import { err, fromPromise, ok } from 'neverthrow';
import { z } from 'zod/v4';

// Just a example action
export interface PingUserRedisActionArgs {
  userId: string;
}

export default class PingUserRedisAction implements RedisActionInterface {
  static containerInjections = {
    _constructor: {
      dependencies: ['discord.client'],
    },
  };

  public readonly name: string = 'ping-user';

  public constructor(protected readonly _discord: Client) { }

  public async execute(guildId: Snowflake, args: PingUserRedisActionArgs): Promise<Result<void, Error>> {
    const user = await this._discord.users.fetch(args.userId);

    if (! user) {
      return err(new Error(`Member with ID ${args.userId} not found.`));
    }

    return fromPromise(user.send({
      content: `Pong! Your ID is ${args.userId}`,
    }).then(void 0), () => new Error(`Failed to send message to user ${args.userId}`));
  }

  public validate(rawArgs: unknown): Result<PingUserRedisActionArgs, Error> {
    const res = z.object({
      userId: z.string(),
    }).safeParse(rawArgs);

    return res.success ? ok(res.data) : err(res.error);
  }
}
