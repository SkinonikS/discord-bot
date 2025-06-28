import type { Application, ConfigRepository, ModuleInterface } from '@framework/core/app';
import pkg from '#root/package.json';
import type { LoggerConfig } from '#src/config/types';
import type { LoggerInterface, LoggerFactoryInterface } from '#src/types';
import WinstonLoggerFactory from '#src/winston/winston-logger-factory';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'logger': LoggerInterface;
    'logger.factory': LoggerFactoryInterface;
  }

  interface ConfigBindings {
    'logger': LoggerConfig;
  }
}

export default class LoggerModule implements ModuleInterface {
  public readonly id = pkg.name;
  public readonly author = pkg.author;
  public readonly version = pkg.version;

  public register(app: Application): void {
    app.container.singleton('logger.factory', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const loggerConfig = config.get('logger');
      if (loggerConfig.isErr()) {
        throw loggerConfig.error;
      }

      const app = await container.make('app');
      return new WinstonLoggerFactory(app, loggerConfig.value);
    });

    app.container.singleton('logger', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const loggerConfig = config.get('logger');
      if (loggerConfig.isErr()) {
        throw loggerConfig.error;
      }

      const factory = await container.make('logger.factory');
      return factory.createLogger(loggerConfig.value.label);
    });
  }
}
