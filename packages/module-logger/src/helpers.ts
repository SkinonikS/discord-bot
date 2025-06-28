import { Application } from '@framework/core/app';
import type { LoggerInterface } from '#src/types';

export const getDefaultLogger = async (app?: Application): Promise<LoggerInterface> => {
  app ??= Application.getInstance();
  return app.container.make('logger');
};

export const createLogSource = async (label: string, app?: Application): Promise<LoggerInterface> => {
  app ??= Application.getInstance();
  const loggerFactory = await app.container.make('logger.factory');
  return loggerFactory.createLogger(label);
};
