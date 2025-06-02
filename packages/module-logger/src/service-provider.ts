import type { Application, ServiceProviderInterface } from '@package/framework';
import type { LoggerInterface, LoggerFactoryInterface } from '#/types';
import { WinstonLoggerFactory } from '#/winston-logger';

declare module '@package/framework' {
  interface ContainerBindings {
    'logger': LoggerInterface;
    'logger.factory': LoggerFactoryInterface;
  }
}

export default class LoggerServiceProvider implements ServiceProviderInterface {
  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.singleton('logger.factory', async (container) => {
      const app = await container.make('app');
      return new WinstonLoggerFactory(app, app.path.logs());
    });

    this._app.container.singleton('logger', async (container) => {
      const factory = await container.make('logger.factory');
      return factory.createLogSource('Application');
    });
  }
}
