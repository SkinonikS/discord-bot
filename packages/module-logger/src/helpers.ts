import { Application, defineBaseConfig } from '@package/framework';
import type { LoggerConfig, LoggerInterface, LoggerOptions } from '#/types';

export const createLogSource = async (options: LoggerOptions, app?: Application): Promise<LoggerInterface> => {
  app ??= Application.getInstance();
  const loggerFactory = await app.container.make('logger.factory');
  return loggerFactory.createLogger(options);
};

export const defineLoggerConfig = (config: Partial<LoggerConfig>) => defineBaseConfig('logger', {
  name: config.name ?? 'kernel',
  level: config.level ?? 'info',
});
