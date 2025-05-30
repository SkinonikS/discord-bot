import { Application } from '#core/application/application';
import { ServiceProviderInterface } from '#core/application/types';
import { WinstonLoggerFactory } from '#modules/logger/winston';

export default class LoggerServiceProvider implements ServiceProviderInterface {
  public constructor(protected readonly _app: Application) { }

  register(): void {
    this._app.container.bind('Logger.Factory').toDynamicValue((ctx) => {
      const app = ctx.get<Application>('Application');
      return new WinstonLoggerFactory(app, app.path.logs());
    }).inSingletonScope();

    this._app.container.bind('Logger').toDynamicValue((ctx) => {
      const factory = ctx.get<WinstonLoggerFactory>('Logger.Factory');
      return factory.createLogSource('Application');
    }).inSingletonScope();
  }
}
