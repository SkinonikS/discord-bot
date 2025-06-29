import type { ConfigRepository, ModuleInterface, Application } from '@framework/core/app';
import { type Client, Events } from '@module/discord/vendors/discordjs';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import pkg from '#root/package.json';
import type { SlashCommandConfig } from '#src/config/types';
import Manager from '#src/manager';
import type { RateLimiterInterface } from '#src/types';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'slash-commands': Manager;
    'slash-commands.logger': LoggerInterface;
    'slash-commands.rate-limiter': RateLimiterInterface;
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
    app.container.singleton('slash-commands.rate-limiter', async (container) => {
      const app = await container.make('app');
      const config: ConfigRepository = await container.make('config');

      const slashCommandConfig = config.get('slash-commands');
      if (slashCommandConfig.isErr()) {
        throw slashCommandConfig.error;
      }

      return slashCommandConfig.value.rateLimiter.driver.create(app, {
        points: slashCommandConfig.value.rateLimiter.points,
        durationMs: slashCommandConfig.value.rateLimiter.durationMs,
      });
    });

    app.container.singleton('slash-commands', async (container) => {
      return new Manager(
        await container.make('app'),
        await container.make('discord.client'),
        await container.make('slash-commands.rate-limiter'),
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

    discord.on(Events.ClientReady, async (discord) => {
      const guilds = Array.from(discord.guilds.cache.values());
      // TODO: Added just for testing purposes, remove later
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
    if (slashCommandConfig.isErr()) {
      throw slashCommandConfig.error;
    }

    if (slashCommandConfig) {
      await manager.register(slashCommandConfig.value.commands);
    }
  }
}
