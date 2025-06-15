import { Application, defineBaseConfig } from '@framework/core';
import NullTransportLoader from '#/transport-loaders/null-transport-loader';
import type { LoggerConfig, LoggerInterface } from '#/types';

export const getDefaultLogger = async (app?: Application): Promise<LoggerInterface> => {
  app ??= Application.getInstance();
  return app.container.make('logger');
};

export const createLogSource = async (label: string, app?: Application): Promise<LoggerInterface> => {
  app ??= Application.getInstance();
  const loggerFactory = await app.container.make('logger.factory');
  return loggerFactory.createLogger(label);
};

export const defineLoggerConfig = (config: Partial<LoggerConfig>) => defineBaseConfig<LoggerConfig>('logger', {
  label: config.label ?? 'DiscordBOT',
  defaultMeta: config.defaultMeta ?? {},
  level: config.level ?? 'info',
  transports: config.transports ?? new NullTransportLoader(),
});
