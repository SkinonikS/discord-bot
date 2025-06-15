import { ConfigNotFoundException, type Application, type ConfigRepository, type ModuleInterface } from '@framework/core';
import pkg from '../package.json';
import TransportFactory from '#/transport-factory';
import type { LoggerInterface, LoggerFactoryInterface, LoggerConfig } from '#/types';
import WinstonLoggerFactory from '#/winston-logger-factory';

declare module '@framework/core' {
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

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.singleton('logger.factory', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const loggerConfig = config.get('logger');

      if (! loggerConfig) {
        throw new ConfigNotFoundException([this.id]);
      }

      const app = await container.make('app');
      return new WinstonLoggerFactory(app, loggerConfig, loggerConfig.transports);
    });

    this._app.container.singleton('logger', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const loggerConfig = config.get('logger');

      if (! loggerConfig) {
        throw new ConfigNotFoundException([this.id]);
      }

      const factory = await container.make('logger.factory');
      return factory.createLogger(loggerConfig.label);
    });
  }
}
