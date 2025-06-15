import type { Application } from '@framework/core';
import { importDefault } from '@poppinss/utils';
import type { CommandsLoaderInterface, SlashCommandInterface } from '#/types';

export type CommandResolver = ((app: Application) => Promise<{ default: new (...args: unknown[]) => SlashCommandInterface } | SlashCommandInterface>);
export default class LazyCommandLoader implements CommandsLoaderInterface {
  public constructor(protected readonly _resolvers: CommandResolver[]) { }

  public async load(app: Application): Promise<SlashCommandInterface[]> {
    const commands = this._resolvers.map(async (resolver) => {
      const Command = await importDefault(() => resolver(app));
      return Command instanceof Function ? app.container.make(Command) : Command;
    });

    return Promise.all(commands);
  }
}
