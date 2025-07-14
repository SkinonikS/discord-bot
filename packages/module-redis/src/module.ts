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
      const logger: LoggerInterface = await container.make('logger');
      const config: ConfigRepository = await container.make('config');
      const redisConfig = config.get('redis');
      return new Manager(redisConfig, logger);
    });

    app.container.bind('redis.client', async (container) => {
      const manager = await container.make('redis');
      return manager.client();
    });
  }

  public async start(app: Application): Promise<void> {
    const manager = await app.container.make('redis');
    await manager.connect(); // Here we await the connection to ensure Redis is ready before proceeding
  }

  public async shutdown(app: Application): Promise<void> {
    const manager = await app.container.make('redis');
    await manager.disconnect();
  }
}
