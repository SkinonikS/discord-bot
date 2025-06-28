import type { Application, ConfigRepository, ModuleInterface } from '@framework/core/app';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { Client, Events } from 'discord.js';
import { debug } from '#root/debug';
import pkg from '#root/package.json';
import type { DiscordConfig } from '#src/config/types';
import { Connector } from '#src/connection';
import Handler from '#src/handler';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'discord.client': Client;
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
    app.container.singleton('discord.client', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const discordConfig = config.get('discord');
      if (discordConfig.isErr()) {
        throw discordConfig.error;
      }

      return new Client({
        intents: discordConfig.value.intents,
        presence: discordConfig.value.richPresence,
        shardCount: discordConfig.value.shardCount,
        shards: discordConfig.value.shardId,
      });
    });

    app.container.singleton('discord.logger', async (container) => {
      const factory: LoggerFactoryInterface = await container.make('logger.factory');
      return factory.createLogger(this.id);
    });
  }

  public async boot(app: Application): Promise<void> {
    debug('Booting Discord module...');

    const discord = await app.container.make('discord.client');

    const controller = new Handler(
      await app.container.make('errorHandler'),
      await app.container.make('discord.logger'),
    );

    discord.on(Events.ClientReady, (client) => controller.clientReady(client));
    discord.on(Events.Debug, (message) => controller.debug(message));
    discord.on(Events.Error, (error) => controller.error(error));
  }

  public async start(app: Application): Promise<void> {
    debug('Starting Discord module...');

    const config: ConfigRepository = await app.container.make('config');
    const discordConfig = config.get('discord');
    if (discordConfig.isErr()) {
      throw discordConfig.error;
    }

    const discord = await app.container.make('discord.client');
    const connector = new Connector(
      discord,
      await discordConfig.value.rateLimiter.create(app),
      await app.container.make('discord.logger'),
    );

    connector.connect(discordConfig.value.token);
  }

  public async shutdown(app: Application): Promise<void> {
    debug('Shutting down Discord module...');

    const discord = await app.container.make('discord.client');
    const logger = await app.container.make('discord.logger');

    debug('Shutting down Discord module...');
    if (discord.isReady()) {
      await discord.destroy();
      logger.info('Discord client has been destroyed');
      debug('Discord client has been destroyed');
    } else {
      logger.notice('Discord client was not ready, nothing to destroy');
      debug('Discord client was not ready, nothing to destroy');
    }
  }
}
