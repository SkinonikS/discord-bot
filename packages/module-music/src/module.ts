import type { Application, ModuleInterface } from '@framework/core';
import { LazyCommandsLoader, type SlashCommandManager } from '@module/slash-commands';
import pkg from '../package.json';

export default class MusicModule implements ModuleInterface {
  public readonly id = pkg.name;
  public readonly author = pkg.author;
  public readonly version = pkg.version;

  public constructor(protected readonly _app: Application) { }

  public async boot(): Promise<void> {
    const slashCommands: SlashCommandManager = await this._app.container.make('slash-commands');

    await slashCommands.register(new LazyCommandsLoader([
      () => import('#/commands/music'),
      () => import('#/commands/record'),
    ]));
  }
}
