import type { Application, ConfigRepository, ModuleInterface } from '@package/framework';
import type { LoggerInterface, LoggerFactoryInterface, LoggerConfig } from '#/types';
import WinstonLogger from '#/winston-logger';
import WinstonLoggerFactory from '#/winston-logger-factory';

declare module '@package/framework' {
  interface ContainerBindings {
    'logger': LoggerInterface;
    'logger.factory': LoggerFactoryInterface;
  }

  interface ConfigBindings {
    'logger': LoggerConfig;
  }
}

export default class LoggerModule implements ModuleInterface {
  public readonly id = 'logger';

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.singleton('logger.factory', async (container) => {
      const app = await container.make('app');
      return new WinstonLoggerFactory(app, app.path.logs());
    });

    this._app.container.singleton('logger', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const loggerConfig = config.get('logger');

      if (! loggerConfig) {
        throw new Error('Logger configuration is missing. Maybe you forgot to add it into `bootstrap/kernel.ts`?');
      }

      const level = loggerConfig.level instanceof Function
        ? loggerConfig.level(this._app)
        : loggerConfig.level;

      const factory = await container.make('logger.factory');
      return factory.createLogger({
        name: loggerConfig.name,
        level,
      });
    });
  }
}
