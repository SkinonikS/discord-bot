import { moduleImporter } from '@adonisjs/fold';
import type { ConfigRepository } from '@package/framework';
import { type Application, type ServiceProviderInterface } from '@package/framework';
import { getDiscordClient } from '@package/module-discord-client';
import { createLogSource, type LoggerInterface } from '@package/module-logger';
import type { Client } from 'discord.js';
import { Events } from 'discord.js';
import SlashCommandManager from '#/manager';
import type { SlashCommandConfig } from '#/types';

declare module '@package/framework' {
  interface ContainerBindings {
    'slash-commands': SlashCommandManager;
    'slash-commands.logger': LoggerInterface;
  }

  interface ConfigBindings {
    'slash-commands': SlashCommandConfig;
  }
}

export default class SlashCommandServiceProvider implements ServiceProviderInterface {
  protected declare _logger: LoggerInterface;
  protected declare _discord: Client;

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.singleton('slash-commands', async (container) => {
      const config = await this._app.container.make('config') as ConfigRepository;
      const slashCommandConfig = config.get('slash-commands') as SlashCommandConfig;

      if (! slashCommandConfig) {
        this._logger.critical(new Error('Slash command configuration is missing. Maybe you forgot to add it into `bootstrap/kernel.ts`?'));
        process.exit(1);
      }

      const manager = new SlashCommandManager(
        await container.make('app'),
        await container.make('discord.client'),
        this._logger,
      );

      await manager.register(slashCommandConfig.commands);

      return manager;
    });
  }

  public async boot(): Promise<void> {
    this._discord = await getDiscordClient();
    this._logger = await createLogSource('SlashCommands');

    this._discord.once(Events.ClientReady, async () => {
      const manager = await this._app.container.make('slash-commands');
      void manager.deployToDiscord().catch((error) => this._logger.error(error));
    });

    this._discord.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isChatInputCommand()) {
        const manager = await this._app.container.make('slash-commands');
        void manager.interact(interaction).catch((error) => this._logger.error(error));
      }
    });
  }
}
