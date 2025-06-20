import { ConfigNotFoundException } from '@framework/core';
import type { Application, ConfigRepository, ModuleInterface } from '@framework/core';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { fromPromise } from 'neverthrow';
import { createClient } from 'redis';
import pkg from '../package.json';
import { DiscordActionHandler } from './handlers/discord-action';
import RedisActionManager from '#/redis-action-manager';
import type { RedisActionsConfig } from '#/types';

declare module '@framework/core' {
  interface ContainerBindings {
    'redis-actions': RedisActionManager;
    'redis-actions.client': ReturnType<typeof createClient>;
    'redis-actions.logger': LoggerInterface;
  }

  interface ConfigBindings {
    'redis-actions': RedisActionsConfig;
  }
}

export default class RedisCommansModule implements ModuleInterface {
  public readonly id: string = pkg.name;
  public readonly author: string = pkg.author;
  public readonly version: string = pkg.version;

  public register(app: Application): void {
    app.container.singleton('redis-actions', async (container) => {
      return new RedisActionManager(
        await container.make('app'),
        await container.make('discord.client'),
        await container.make('redis-actions.logger'),
      );
    });

    app.container.singleton('redis-actions.client', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const redisConfig = config.get('redis-actions');

      if (! redisConfig) {
        throw new ConfigNotFoundException('redis-actions');
      }

      return createClient({
        url: redisConfig.url,
        socket: {
          reconnectStrategy: false,
        },
      });
    });

    app.container.singleton('redis-actions.logger', async (container) => {
      const loggerFactory: LoggerFactoryInterface = await container.make('logger.factory');
      return loggerFactory.createLogger(this.id);
    });
  }

  public async boot(app: Application): Promise<void> {
    const commands = await app.container.make('redis-actions');
    const config: ConfigRepository = await app.container.make('config');
    const redisActionConfig = config.get('redis-actions');

    if (! redisActionConfig) {
      throw new ConfigNotFoundException('redis-actions');
    }

    await commands.register(redisActionConfig.actions);
  }

  public async start(app: Application): Promise<void> {
    const commands = await app.container.make('redis-actions');
    const logger = await app.container.make('redis-actions.logger');
    const redis = await app.container.make('redis-actions.client');

    const connectionResult = await fromPromise(redis.connect(), (error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Error(`Failed to connect to Redis: ${errorMessage}`);
    });

    if (connectionResult.isErr()) {
      logger.error(connectionResult.error);
      logger.error('Redis client is not connected, actions will not be processed. Check your Redis server or configuration.');
      return;
    }

    logger.info('Redis subscriber is ready and listening for actions');
    const handler = new DiscordActionHandler(commands, logger);
    redis.subscribe('discord-actions', (message) => handler.handle(message));
  }

  public async shutdown(app: Application): Promise<void> {
    const redis = await app.container.make('redis-actions.client');
    const logger = await app.container.make('redis-actions.logger');

    if (! redis.isOpen) {
      logger.warn('Redis client is not connected, skipping unsubscribe and quit');
      return;
    }

    await redis.unsubscribe('discord-actions');
    await redis.quit();

    logger.info('Redis subscriber has been unsubscribed and client disconnected');
  }
}
