import { fromThrowable } from 'neverthrow';
import { ImportNotFoundException } from './exceptions';
import Application from '#/application';
import type ConfigRepository from '#/config-repository';
import type ErrorHandler from '#/error-handler';
import type { BaseConfig, KernelConfig, BaseResolver } from '#/types';

export const safeJsonParse = fromThrowable(JSON.parse, () => new Error('Invalid JSON format'));

export const defineBaseConfig = <T>(key: string, config: T): BaseConfig<T> => ({
  key,
  config,
});

export const defineKernelConfig = (config: Partial<KernelConfig>): KernelConfig => ({
  configFiles: config.configFiles || [],
  modules: config.modules || [],
});

export const getApplication = (): Application => {
  return Application.getInstance();
};

export const getErrorHandler = (app?: Application): Promise<ErrorHandler> => {
  app ??= Application.getInstance();
  return app.container.make('errorHandler');
};

export const getConfig = async (app?: Application): Promise<ConfigRepository> => {
  app ??= Application.getInstance();
  return app.container.make('config');
};

export async function report(error: Error, app?: Application): Promise<void> {
  const errorHandler = await getErrorHandler(app);
  return errorHandler.report(error);
}

export async function importModule<T = never>(resolver: BaseResolver<T>, ...args: unknown[]): Promise<T> {
  const module = await resolver(...args);

  if (! module) {
    throw new ImportNotFoundException(resolver.name);
  }

  if (module && typeof module === 'object' && 'default' in module) {
    return module.default;
  }

  return module;
}

export const instantiateIfNeeded = async <T>(target: T | (new () => T), app?: Application): Promise<T> => {
  if (target instanceof Function) {
    app ??= Application.getInstance();
    return app.container.make(target);
  }

  return target;
};
