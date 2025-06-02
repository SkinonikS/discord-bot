import { Application } from '@package/framework';
import type { LoggerInterface } from '#/types';

export const createLogSource = async (source: string, app?: Application): Promise<LoggerInterface> => {
  app ??= Application.getInstance();
  const loggerFactory = await app.container.make('logger.factory');
  return loggerFactory.createLogSource(source);
};
