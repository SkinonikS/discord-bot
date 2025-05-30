import { Application } from '#core/application/application';
import { LoggerFactoryInterface, LoggerInterface } from '#modules/logger/types';

export const createLogger = (source: string, app?: Application): LoggerInterface => {
  app ??= Application.getInstance();

  const loggerFactory = app.container.get<LoggerFactoryInterface>('Logger.Factory');
  return loggerFactory.createLogSource(source);
};
