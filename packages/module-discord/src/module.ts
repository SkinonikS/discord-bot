import type { Application } from '@framework/core';
import { type ConfigRepository, type ModuleInterface, ConfigNotFoundException } from '@framework/core';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { Client, Events } from 'discord.js';
import pkg from '../package.json';
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
  public readonly id = pkg.name;
  public readonly author = pkg.author;
  public readonly version = pkg.version;

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.singleton(Client, async (container) => {
      const config: ConfigRepository = await container.make('config');
      const discordConfig = config.get('discord');

      if (! discordConfig) {
        throw new ConfigNotFoundException([this.id]);
      }

      return new Client({
        intents: discordConfig.intents,
        presence: discordConfig.richPresence,
      });
    });

    this._app.container.singleton('discord.logger', async (container) => {
      const factory: LoggerFactoryInterface = await container.make('logger.factory');
      return factory.createLogger(this.id);
    });

    this._app.container.alias('discord.client', Client);

    this._app.onBooted(async (app) => {
      const discord = await app.container.make('discord.client');
      const config: ConfigRepository = await app.container.make('config');
      const discordConfig = config.get('discord');

      if (discordConfig) {
        await discord.login();
      }
    });

    this._app.onShutdown(async (app) => {
      const discord = await app.container.make('discord.client');
      const logger = await app.container.make('discord.logger');

      if (discord.isReady()) {
        await discord.destroy();
        logger.info('Discord client has been destroyed');
      } else {
        logger.warn('Discord client was not ready, nothing to destroy');
      }
    });
  }

  public async boot(): Promise<void> {
    const discord = await this._app.container.make('discord.client');
    const logger = await this._app.container.make('discord.logger');

    discord.on(Events.ShardReady, (shardId) => {
      logger.info(`Shard ${String(shardId)} is reconnecting`);
    });

    discord.on(Events.ShardReconnecting, (shardId) => {
      logger.info(`Shard ${String(shardId)} is reconnecting`);
    });

    discord.on(Events.ShardResume, (shardId, replayedEvents) => {
      logger.info(`Shard ${String(shardId)} resumed with ${replayedEvents} events replayed`);
    });

    discord.on(Events.ShardDisconnect, (event, shardId) => {
      logger.warn(`Shard ${String(shardId)} disconnected: ${event.code}`);
    });

    discord.on(Events.ClientReady, (client) => {
      logger.info(`Discord client is ready as ${client.user.tag}`);
    });

    discord.on(Events.Error, (error) => {
      logger.error('Discord client encountered an error:', error);
    });
  }
}
