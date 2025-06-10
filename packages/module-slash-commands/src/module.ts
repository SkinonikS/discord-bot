import { type ConfigRepository, type ModuleInterface } from '@package/framework';
import type { Application } from '@package/framework';
import type { LoggerFactoryInterface, LoggerInterface } from '@package/module-logger';
import type { Client } from 'discord.js';
import { Events } from 'discord.js';
import SlashCommandManager from '#/slash-command-manager';
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

export default class SlashCommandModule implements ModuleInterface {
  public readonly id = 'slash-commands';

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.alias('slash-commands', SlashCommandManager);
    this._app.container.singleton(SlashCommandManager, async (container) => {
      return new SlashCommandManager(
        await container.make('app'),
        await container.make('discord.client'),
        await container.make('slash-commands.logger'),
      );
    });

    this._app.container.singleton('slash-commands.logger', async (container) => {
      const factory = await container.make('logger.factory') as LoggerFactoryInterface;
      return factory.createLogger({
        name: this.id,
        level: 'debug', // TODO: make this configurable
      });
    });
  }

  public async boot(): Promise<void> {
    const discord: Client = await this._app.container.make('discord.client');
    const manager = await this._app.container.make('slash-commands');

    // TODO: Added just for testing purposes, remove later
    discord.on(Events.ClientReady, async (discord) => {
      const guilds = Array.from(discord.guilds.cache.values());
      manager.deployToGuilds(guilds);
    });

    discord.on(Events.InteractionCreate, (interaction) => {
      if (interaction.isChatInputCommand()) {
        manager.execute(interaction);
      }

      if (interaction.isAutocomplete()) {
        manager.autocomplete(interaction);
      }
    });

    const config: ConfigRepository = await this._app.container.make('config');
    const slashCommandConfig = config.get('slash-commands');
    await manager.register(slashCommandConfig.commands);
  }
}
