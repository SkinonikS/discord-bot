import type { ConfigRepository, ModuleInterface, Application } from '@framework/core';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { type Client, Events } from 'discord.js';
import pkg from '../package.json';
import SlashCommandManager from '#/slash-command-manager';
import type { SlashCommandConfig } from '#/types';

declare module '@framework/core' {
  interface ContainerBindings {
    'slash-commands': SlashCommandManager;
    'slash-commands.logger': LoggerInterface;
  }

  interface ConfigBindings {
    'slash-commands': SlashCommandConfig;
  }
}

export default class SlashCommandModule implements ModuleInterface {
  public readonly id = pkg.name;
  public readonly author = pkg.author;
  public readonly version = pkg.version;

  public register(app: Application): void {
    app.container.singleton('slash-commands', async (container) => {
      return new SlashCommandManager(
        await container.make('app'),
        await container.make('discord.client'),
        await container.make('slash-commands.logger'),
      );
    });

    app.container.singleton('slash-commands.logger', async (container) => {
      const factory: LoggerFactoryInterface = await container.make('logger.factory');
      return factory.createLogger(this.id);
    });
  }

  public async boot(app: Application): Promise<void> {
    const discord: Client = await app.container.make('discord.client');
    const manager = await app.container.make('slash-commands');

    // TODO: Added just for testing purposes, remove later
    discord.on(Events.ClientReady, async (discord) => {
      const guilds = Array.from(discord.guilds.cache.values());
      manager.deployToGuilds(guilds);
    });

    discord.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isChatInputCommand()) {
        await manager.execute(interaction);
      }

      if (interaction.isAutocomplete()) {
        await manager.autocomplete(interaction);
      }
    });

    const config: ConfigRepository = await app.container.make('config');
    const slashCommandConfig = config.get('slash-commands');

    if (slashCommandConfig) {
      await manager.register(slashCommandConfig.commands);
    }
  }
}
