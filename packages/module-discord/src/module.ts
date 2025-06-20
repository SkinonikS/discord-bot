import { ConfigNotFoundException } from '@framework/core';
import type { Application } from '@framework/core';
import type { ConfigRepository, ModuleInterface } from '@framework/core';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { Client, Events } from 'discord.js';
import { debug } from '../debug';
import pkg from '../package.json';
import Controller from '#/controller';
import type { DiscordConfig } from '#/types';

declare module '@framework/core' {
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

      if (! discordConfig) {
        throw new ConfigNotFoundException('discord');
      }

      return new Client({
        intents: discordConfig.intents,
        presence: discordConfig.richPresence,
        shardCount: 1,
        shards: 0,
      });
    });

    app.container.singleton('discord.logger', async (container) => {
      const factory: LoggerFactoryInterface = await container.make('logger.factory');
      return factory.createLogger(this.id);
    });

    debug('Discord module has been registered');
  }

  public async boot(app: Application): Promise<void> {
    const discord = await app.container.make('discord.client');
    const logger = await app.container.make('discord.logger');

    const controller = new Controller(logger);
    discord.on(Events.Debug, (message) => controller.debug(message));
    discord.on(Events.ShardReady, (message) => controller.shardReady(message));
    discord.on(Events.ShardReconnecting, (shardId) => controller.shardReconnecting(shardId));
    discord.on(Events.ShardResume, (shardId, replayedEvents) => controller.shardResume(shardId, replayedEvents));
    discord.on(Events.ShardDisconnect, (event, shardId) => controller.shardDisconnect(event, shardId));
    discord.on(Events.ClientReady, (client) => controller.clientReady(client));
    discord.on(Events.Error, (error) => controller.error(error));
  }

  public async start(app: Application): Promise<void> {
    const discord = await app.container.make('discord.client');
    const config: ConfigRepository = await app.container.make('config');
    const discordConfig = config.get('discord');

    if (! discordConfig) {
      throw new ConfigNotFoundException('discord');
    }

    await discord.login();
    debug('Discord client has been logged in');
  }

  public async shutdown(app: Application): Promise<void> {
    const discord = await app.container.make('discord.client');
    const logger = await app.container.make('discord.logger');

    debug('Shutting down Discord module...');
    if (discord.isReady()) {
      await discord.destroy();
      logger.info('Discord client has been destroyed');
      debug('Discord client has been destroyed');
    } else {
      logger.warn('Discord client was not ready, nothing to destroy');
      debug('Discord client was not ready, nothing to destroy');
    }
  }
}
