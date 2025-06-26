import { ConfigNotFoundException } from '@framework/core';
import type { Application, ErrorHandler, ConfigRepository, ModuleInterface } from '@framework/core';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { Client, Events } from 'discord.js';
import type { createClient } from 'redis';
import { debug } from '../debug';
import pkg from '../package.json';
import Connector from '#/connector';
import Controller from '#/controller';
import { RoundRobinLoadBalancer } from '#/load-balancers/round-robin';
import type { DiscordConfig, LoadBalancerInterface } from '#/types';

declare module '@framework/core' {
  interface ContainerBindings {
    'discord.client': Client;
    'discord.logger': LoggerInterface;
    'discord.lb': LoadBalancerInterface;
  }

  interface ConfigBindings {
    'discord': DiscordConfig;
  }
}

declare module 'discord.js' {
  interface Client {
    shardId: number;
  }
}

export default class DiscordModule implements ModuleInterface {
  readonly id = pkg.name;
  readonly author = pkg.author;
  readonly version = pkg.version;

  public register(app: Application): void {
    app.container.singleton('discord.lb', async (container) => {
      const app = await container.make('app');
      const discord = await container.make('discord.client');
      const redis: ReturnType<typeof createClient> = await container.make('redis.client');
      return new RoundRobinLoadBalancer(app, discord, redis);
    });

    app.container.singleton('discord.client', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const discordConfig = config.get('discord');

      if (! discordConfig) {
        throw new ConfigNotFoundException('discord');
      }

      const client = new Client({
        intents: discordConfig.intents,
        presence: discordConfig.richPresence,
        shardCount: discordConfig.shardCount,
        shards: discordConfig.shardId,
      });

      client.shardId = discordConfig.shardId;
      return client;
    });

    app.container.singleton('discord.logger', async (container) => {
      const factory: LoggerFactoryInterface = await container.make('logger.factory');
      return factory.createLogger(this.id);
    });
  }

  public async boot(app: Application): Promise<void> {
    debug('Booting Discord module...');

    const discord = await app.container.make('discord.client');
    const logger = await app.container.make('discord.logger');
    const errorHandler: ErrorHandler = await app.container.make('errorHandler');

    const controller = new Controller(logger, errorHandler);
    discord.on(Events.Debug, (message) => controller.debug(message));
    discord.on(Events.ShardReady, (message) => controller.shardReady(message));
    discord.on(Events.ShardReconnecting, (shardId) => controller.shardReconnecting(shardId));
    discord.on(Events.ShardResume, (shardId, replayedEvents) => controller.shardResume(shardId, replayedEvents));
    discord.on(Events.ShardDisconnect, (event, shardId) => controller.shardDisconnect(event, shardId));
    discord.on(Events.ClientReady, (client) => controller.clientReady(client));
    discord.on(Events.Error, (error) => controller.error(error));
  }

  public async start(app: Application): Promise<void> {
    debug('Starting Discord module...');

    const loadBalancer = await app.container.make('discord.lb');
    const discord = await app.container.make('discord.client');

    const config: ConfigRepository = await app.container.make('config');
    const discordConfig = config.get('discord');

    if (! discordConfig) {
      throw new ConfigNotFoundException('discord');
    }

    discord.on(Events.ShardReady, async () => {
      await loadBalancer.register();
    });

    discord.on(Events.ShardDisconnect, async () => {
      await loadBalancer.unregister();
    });

    this._tryConnect(app, discord, discordConfig); // This should not be awaited
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
      logger.warn('Discord client was not ready, nothing to destroy');
      debug('Discord client was not ready, nothing to destroy');
    }
  }

  protected async _tryConnect(app: Application, discord: Client, discordConfig: DiscordConfig): Promise<void> {
    const redis: ReturnType<typeof createClient> = await app.container.make('redis.client');
    const logger = await app.container.make('discord.logger');

    const rateLimitRedis = redis.duplicate({
      database: discordConfig.rateLimiter.database,
    });

    const connector = new Connector(rateLimitRedis, discordConfig, discord, logger);
    await connector.connect();
  }
}
