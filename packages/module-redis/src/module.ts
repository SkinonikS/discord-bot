import type { Application, ConfigRepository, ModuleInterface } from '@framework/core/app';
import type { LoggerInterface } from '@module/logger';
import type { RedisClientType } from 'redis';
import pkg from '#root/package.json';
import type { RedisConfig } from '#src/config/types';
import Manager from '#src/manager';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'redis': Manager;
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
    app.container.singleton('redis', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const redisConfig = config.get('redis');
      if (redisConfig.isErr()) {
        throw redisConfig.error;
      }

      return new Manager(redisConfig.value);
    });

    app.container.bind('redis.client', async (container) => {
      const manager = await container.make('redis');
      const redis = manager.client();
      if (redis.isErr()) {
        throw redis.error;
      }

      return redis.value;
    });

    app.container.singleton('redis.logger', async (container) => {
      const logger: LoggerInterface = await container.make('logger');
      return logger.copy(this.id);
    });
  }

  public async start(app: Application): Promise<void> {
    const manager = await app.container.make('redis');
    const logger = await app.container.make('redis.logger');

    const connectResult = await manager.connect();
    if (connectResult.isErr()) {
      throw connectResult.error;
    } else {
      logger.info('Successfully connected to Redis');
    }
  }

  public async shutdown(app: Application): Promise<void> {
    const manager = await app.container.make('redis');
    await manager.disconnect();
  }
}
