import type { Application } from '@framework/core';
import { importDefault } from '@poppinss/utils';
import type { RedisCommandLoaderInterface, RedisCommandInterface } from '#/types';

export type RedisCommandResolver = ((app: Application) => Promise<{ default: new (...args: unknown[]) => RedisCommandInterface }>);
export default class LazyRedisCommandLoader implements RedisCommandLoaderInterface {
  public constructor(protected readonly _resolvers: RedisCommandResolver[]) { }

  public async load(app: Application): Promise<RedisCommandInterface[]> {
    const commands = this._resolvers.map(async (resolver) => {
      const Command = await importDefault(() => resolver(app));
      return app.container.make(Command);
    });

    return Promise.all(commands);
  }
}
