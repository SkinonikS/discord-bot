import type { Application } from '@package/framework';
import type { CommandsLoaderInterface, SlashCommandInterface } from '#/types';

export type CommandResolver = ((app: Application) => Promise<{ default: new (...args: unknown[]) => SlashCommandInterface } | SlashCommandInterface>);

export default class LazyCommandsLoader implements CommandsLoaderInterface {
  public constructor(protected _resolvers: CommandResolver[]) {}

  public async load(app: Application): Promise<SlashCommandInterface[]> {
    const commands = this._resolvers.map(async (resolver) => {
      const nodeModule = await resolver(app);
      if ('default' in nodeModule) {
        return app.container.make(nodeModule.default);
      }
      return nodeModule;
    });

    return Promise.all(commands);
  }
}
