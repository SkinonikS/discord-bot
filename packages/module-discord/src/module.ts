import type { Application, ConfigRepository, ErrorHandler, ModuleInterface } from '@framework/core/app';
import type { LoggerInterface } from '@module/logger';
import { Client, DiscordjsErrorCodes, Events } from 'discord.js';
import pkg from '#root/package.json';
import type { DiscordConfig } from '#src/config/types';
import { Connector } from '#src/connection';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'discord.client': Client;
    'discord.connector': Connector;
  }

  interface ConfigBindings {
    'discord': DiscordConfig;
  }
}

export default class DiscordModule implements ModuleInterface {
  public readonly id = pkg.name;
  public readonly author = pkg.author;
  public readonly version = pkg.version;

  public register(app: Application): void {
    app.container.singleton('discord.connector', async (container) => {
      const app = await container.make('app');
      const config: ConfigRepository = await container.make('config');
      const discordConfig = config.get('discord');

      const rateLimiter = await discordConfig.rateLimiter.driver.create(app, {
        durationMs: discordConfig.rateLimiter.durationMs,
        points: discordConfig.rateLimiter.points,
      });

      return new Connector(
        await container.make('discord.client'),
        rateLimiter,
        await container.make('logger'),
        await container.make('errorHandler'),
        discordConfig.token,
      );
    });

    app.container.singleton('discord.client', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const discordConfig = config.get('discord');
      const errorHandler: ErrorHandler = await container.make('errorHandler');
      const logger: LoggerInterface = await container.make('logger');

      const discord = new Client({
        intents: discordConfig.intents,
        presence: discordConfig.richPresence,
        shardCount: discordConfig.shardCount,
        shards: discordConfig.shardId,
      });

      discord.on(Events.ClientReady, (client) => logger.info(`Discord client is ready as '${client.user.tag}'`));
      discord.on(Events.Debug, (message) => logger.debug(message));
      discord.on(Events.Error, (error) => errorHandler.handle(error));

      return discord;
    });
  }

  public async boot(app: Application): Promise<void> {
    const errorHandler: ErrorHandler = await app.container.make('errorHandler');

    errorHandler.addFatalErrorCode([
      DiscordjsErrorCodes.TokenInvalid,
      DiscordjsErrorCodes.TokenMissing,
      DiscordjsErrorCodes.ClientMissingIntents,
      DiscordjsErrorCodes.ClientInvalidOption,
    ]);
  }

  public async start(app: Application): Promise<void> {
    const connector = await app.container.make('discord.connector');
    connector.connect(); // Not awaiting this allows the app to continue starting
  }

  public async shutdown(app: Application): Promise<void> {
    const connector = await app.container.make('discord.connector');
    await connector.disconnect();
  }
}
