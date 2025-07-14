import type { ConfigRepository, ModuleInterface, Application } from '@framework/core/app';
import { Events } from '@module/discord/vendors/discordjs';
import type { Client } from '@module/discord/vendors/discordjs';
import type { LoggerInterface } from '@module/logger';
import pkg from '#root/package.json';
import type { SlashCommandConfig } from '#src/config/types';
import AutocompleteHandler from '#src/handlers/autocomplete-handler';
import ExecuteHandler from '#src/handlers/execute-handler';
import Manager from '#src/manager';
import type { RateLimiterInterface } from '#src/types';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'slash-commands': Manager;
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

      return slashCommandConfig.rateLimiter.driver.create(app, {
        points: slashCommandConfig.rateLimiter.points,
        durationMs: slashCommandConfig.rateLimiter.durationMs,
      });
    });

    app.container.singleton('slash-commands', async (container) => {
      const config: ConfigRepository = await app.container.make('config');
      const slashCommandConfig = config.get('slash-commands');

      const manager = new Manager(
        await container.make('app'),
        await container.make('discord.client'),
        await container.make('logger'),
      );

      await manager.register(slashCommandConfig.commands);
      return manager;
    });
  }

  public async boot(app: Application): Promise<void> {
    const discord: Client = await app.container.make('discord.client');
    const manager = await app.container.make('slash-commands');
    const config: ConfigRepository = await app.container.make('config');
    const slashCommandConfig = config.get('slash-commands');

    discord.on(Events.ClientReady, async (discord) => {
      const guilds = Array.from(discord.guilds.cache.values());
      manager.deployToGuilds(guilds);
    });

    const logger: LoggerInterface = await app.container.make('logger');
    const rateLimiter = await app.container.make('slash-commands.rate-limiter');

    const executeHandler = new ExecuteHandler(app, manager, logger, rateLimiter, slashCommandConfig.rateLimiter.message);
    const autocompleteHandler =  new AutocompleteHandler(manager, logger);

    discord.on(Events.InteractionCreate, (interaction) => {
      if (interaction.isChatInputCommand()) {
        executeHandler.handle(interaction);
      } else if (interaction.isAutocomplete()) {
        autocompleteHandler.handle(interaction);
      }
    });
  }
}
