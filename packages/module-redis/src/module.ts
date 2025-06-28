import type { Application, ConfigRepository, ModuleInterface } from '@framework/core/app';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { fromPromise } from 'neverthrow';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import pkg from '#root/package.json';
import type { RedisConfig } from '#src/config/types';

declare module '@framework/core' {
  interface ContainerBindings {
    'redis.client': RedisClientType;
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
      if (redisConfig.isErr()) {
        throw redisConfig.error;
      }

      return createClient({
        url: `${redisConfig.value.secure ? 'rediss' : 'redis'}://${redisConfig.value.host}:${redisConfig.value.port}`,
        database: redisConfig.value.database,
        password: redisConfig.value.password ?? undefined,
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

    fromPromise(
      redis.connect(),
      (e) => e instanceof Error ? e : new Error('Unknown error occurred while connecting to Redis'),
    ).then((connectResult) => {
      if (connectResult.isErr()) {
        logger.warn(connectResult.error);
      }
    });
  }
}
