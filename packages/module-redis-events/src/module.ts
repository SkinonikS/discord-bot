import { ConfigNotFoundException } from '@framework/core';
import type { Application, ConfigRepository, ModuleInterface } from '@framework/core';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { fromPromise } from 'neverthrow';
import type { createClient } from 'redis';
import pkg from '../package.json';
import EventManager from '#/event-manager';
import { EventRouter } from '#/event-router';
import type { EventsConfig } from '#/types';

declare module '@framework/core' {
  interface ContainerBindings {
    'redis-events': EventManager;
    'redis-events.client': ReturnType<typeof createClient>;
    'redis-events.logger': LoggerInterface;
    'redis-events.router': EventRouter;
  }

  interface ConfigBindings {
    'redis-events': EventsConfig;
  }
}

export default class RedisCommansModule implements ModuleInterface {
  public readonly id: string = pkg.name;
  public readonly author: string = pkg.author;
  public readonly version: string = pkg.version;

  public register(app: Application): void {
    app.container.singleton('redis-events.router', async (container) => {
      return new EventRouter(
        await container.make('redis-events.client'),
        await container.make('redis-events'),
        await container.make('redis-events.logger'),
      );
    });

    app.container.singleton('redis-events', async (container) => {
      return new EventManager(
        await container.make('app'),
        await container.make('discord.client'),
        await container.make('redis-events.logger'),
      );
    });

    app.container.singleton('redis-events.client', async (container) => {
      const redis: ReturnType<typeof createClient> = await container.make('redis.client');
      const config: ConfigRepository = await container.make('config');
      const redisEventsConfig = config.get('redis-events');

      if (! redisEventsConfig) {
        throw new ConfigNotFoundException('redis-events');
      }

      return redis.duplicate({
        database: redisEventsConfig.database,
      });
    });

    app.container.singleton('redis-events.logger', async (container) => {
      const loggerFactory: LoggerFactoryInterface = await container.make('logger.factory');
      return loggerFactory.createLogger(this.id);
    });
  }

  public async boot(app: Application): Promise<void> {
    const commands = await app.container.make('redis-events');
    const config: ConfigRepository = await app.container.make('config');
    const redisEventsConfig = config.get('redis-events');

    if (! redisEventsConfig) {
      throw new ConfigNotFoundException('redis-events');
    }

    await commands.register(redisEventsConfig.eventHandlers);
  }

  public async start(app: Application): Promise<void> {
    const config: ConfigRepository = await app.container.make('config');
    const redisEventsConfig = config.get('redis-events');

    if (! redisEventsConfig) {
      throw new ConfigNotFoundException('redis-events');
    }

    const logger = await app.container.make('redis-events.logger');
    const router = await app.container.make('redis-events.router');

    router.subscribe(redisEventsConfig.channelName).then(() => {
      logger.info(`Subscribed to Redis events channel '${redisEventsConfig.channelName}'`);
    });
  }

  public async shutdown(app: Application): Promise<void> {
    const config: ConfigRepository = await app.container.make('config');
    const redisEventsConfig = config.get('redis-events');

    if (! redisEventsConfig) {
      throw new ConfigNotFoundException('redis-events');
    }

    const router = await app.container.make('redis-events.router');
    const logger = await app.container.make('redis-events.logger');

    await router.unsubscribe(redisEventsConfig.channelName);
    logger.info(`Unsubscribed from Redis events channel '${redisEventsConfig.channelName}'`);
  }
}
