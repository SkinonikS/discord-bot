import { ConfigRepository } from '#core/application/config/config-repository';
import { AbstractServiceProvider } from '#core/application/providers/abstract-service-provider';
import SlashCommandManager from '#modules/slash-commands/manager';
import { Events } from 'discord.js';
import { SlashCommandConfig } from './types';

export default class SlashCommandServiceProvider extends AbstractServiceProvider {
  public register(): void {
    this._app.container.bind('Discord.SlashCommands').toDynamicValue((ctx) => {
      return new SlashCommandManager(
        ctx.get('Application'),
        ctx.get('Discord.Client'),
        this._logger,
      );
    }).inSingletonScope();
  }

  public async boot(): Promise<void> {
    const config = this._app.container
      .get<ConfigRepository>('Config')
      .get<SlashCommandConfig>('slash-commands');

    const manager = this._app.container.get<SlashCommandManager>('Discord.SlashCommands');

    await manager.load(config.commands);
    this._discord.once(Events.ClientReady, () => {
      void manager.register();
    });

    this._discord.on(Events.InteractionCreate, (interaction) => {
      if (! interaction.isChatInputCommand()) {
        return;
      }

      void manager.execute(interaction);
    });
  }

  public name(): string {
    return 'SLASH-COMMANDS';
  }
}
