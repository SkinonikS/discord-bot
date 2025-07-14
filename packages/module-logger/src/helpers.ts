import { Application } from '@framework/core/app';
import type { LoggerInterface } from '#src/types';

export const getDefaultLogger = async (app?: Application): Promise<LoggerInterface> => {
  app ??= Application.getInstance();
  return app.container.make('logger');
};

export const createLogChild = async (label: string, app?: Application): Promise<LoggerInterface> => {
  app ??= Application.getInstance();
  const logger: LoggerInterface = await app.container.make('logger');
  return logger.copy(label);
};
