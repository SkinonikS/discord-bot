import type { Application, ModuleInterface } from '@package/framework';
import { LazyCommandsLoader, type SlashCommandManager } from '@package/module-slash-commands';
import type DisTube from 'distube';
import { Events } from 'distube';

export default class MusicModule implements ModuleInterface {
  readonly id = 'music';

  public constructor(protected readonly _app: Application) { }

  public async boot(): Promise<void> {
    const slashCommands: SlashCommandManager = await this._app.container.make('slash-commands');

    await slashCommands.register(new LazyCommandsLoader([
      () => import('#/commands/music'),
    ]));
  }
}
