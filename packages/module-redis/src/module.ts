import { ConfigNotFoundException, type Application, type ConfigRepository, type ModuleInterface } from '@framework/core';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { createClient } from 'redis';
import pkg from '../package.json';
import type { RedisConfig } from '#/types';

declare module '@framework/core' {
  interface ContainerBindings {
    'redis.client': ReturnType<typeof createClient>;
    'redis.logger': LoggerInterface;
  }

  interface ConfigBindings {
    'redis': RedisConfig;
  }
}

export default class RedisModule implements ModuleInterface {
  public readonly id: string = pkg.name;
  public readonly author: string = pkg.author;
  public readonly version: string = pkg.version;

  public register(app: Application): void {
    app.container.singleton('redis.client', async () => {
      const config: ConfigRepository = await app.container.make('config');
      const redisConfig = config.get('redis');

      if (! redisConfig) {
        throw new ConfigNotFoundException('redis');
      }

      return createClient({
        url: `${redisConfig.secure ? 'rediss' : 'redis'}://${redisConfig.host}:${redisConfig.port}`,
        database: redisConfig.database,
        password: redisConfig.password ?? undefined,
        socket: {
          reconnectStrategy: false,
        },
      });
    });

    app.container.singleton('redis.logger', async (container) => {
      const loggerFactory: LoggerFactoryInterface = await container.make('logger.factory');
      return loggerFactory.createLogger(this.id);
    });
  }

  public async start(app: Application): Promise<void> {
    const redis = await app.container.make('redis.client');
    const logger = await app.container.make('redis.logger');

    redis.connect().then(() => {
      logger.info('Redis client connected successfully');
    }).catch((error) => {
      logger.warn(error);
    });
  }
}
