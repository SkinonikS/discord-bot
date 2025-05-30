import { Application } from '#core/application/application';
import { ConfigRepository } from '#core/application/config/config-repository';
import { ServiceProviderInterface } from '#core/application/types';
import { getDiscordClient } from '#modules/discord/get-client';
import { createLogger } from '#modules/logger/create-logger';
import SlashCommandManager from '#modules/slash-commands/manager';
import { SlashCommandConfig } from '#modules/slash-commands/types';
import { Events } from 'discord.js';

export default class SlashCommandServiceProvider implements ServiceProviderInterface {
  protected readonly _logger = createLogger('SlashCommands');
  protected readonly _discord = getDiscordClient();

  public constructor(protected readonly _app: Application) { }

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
