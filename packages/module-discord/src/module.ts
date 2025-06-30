import type { Application, ConfigRepository, ModuleInterface } from '@framework/core/app';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { Client, Events } from 'discord.js';
import { debug } from '#root/debug';
import pkg from '#root/package.json';
import type { DiscordConfig } from '#src/config/types';
import { Connector } from '#src/connection';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'discord.client': Client;
    'discord.connector': Connector;
    'discord.logger': LoggerInterface;
  }

  interface ConfigBindings {
    'discord': DiscordConfig;
  }
}

export default class DiscordModule implements ModuleInterface {
  readonly id = pkg.name;
  readonly author = pkg.author;
  readonly version = pkg.version;

  public register(app: Application): void {
    app.container.singleton('discord.connector', async (container) => {
      const app = await container.make('app');
      const config: ConfigRepository = await container.make('config');
      const discordConfig = config.get('discord');
      if (discordConfig.isErr()) {
        throw discordConfig.error;
      }

      const rateLimiter = await discordConfig.value.rateLimiter.driver.create(app, {
        durationMs: discordConfig.value.rateLimiter.durationMs,
        points: discordConfig.value.rateLimiter.points,
      });

      const logger = await container.make('discord.logger');
      const discord = await container.make('discord.client');

      return new Connector(
        discord,
        rateLimiter,
        logger,
        discordConfig.value.token,
      );
    });

    app.container.singleton('discord.client', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const discordConfig = config.get('discord');
      if (discordConfig.isErr()) {
        throw discordConfig.error;
      }

      const logger = await container.make('discord.logger');

      const discord = new Client({
        intents: discordConfig.value.intents,
        presence: discordConfig.value.richPresence,
        shardCount: discordConfig.value.shardCount,
        shards: discordConfig.value.shardId,
      });

      discord.on(Events.ClientReady, (client) => logger.info(`Discord client is ready as ${client.user.tag}`));
      discord.on(Events.Debug, (message) => logger.debug(message));
      discord.on(Events.Error, (error) => logger.error(error));

      return discord;
    });

    app.container.singleton('discord.logger', async (container) => {
      const factory: LoggerFactoryInterface = await container.make('logger.factory');
      return factory.createLogger(this.id);
    });
  }

  public async start(app: Application): Promise<void> {
    debug('Starting Discord module...');

    const connector = await app.container.make('discord.connector');
    connector.connect().then((connectResult) => {
      if (connectResult.isErr()) {
        throw connectResult.error;
      }
    });
  }

  public async shutdown(app: Application): Promise<void> {
    debug('Shutting down Discord module...');

    const logger: LoggerInterface = await app.container.make('discord.logger');
    const connector = await app.container.make('discord.connector');
    const disconnectResult = await connector.disconnect();

    if (disconnectResult.isOk()) {
      logger.info('Discord client has been destroyed');
    }
  }
}
