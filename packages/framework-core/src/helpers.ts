import Application from '#/application';
import NullConfigFileLoader from '#/config-file-loaders/null-config-file-loader';
import NullModuleLoader from '#/module-loaders/null-module-loader';
import type { BaseConfig, KernelConfig } from '#/types';

export const defineBaseConfig = <T>(key: string, config: T): BaseConfig<T> => ({
  key,
  config,
});

export const defineKernelConfig = (config: Partial<KernelConfig>): KernelConfig => ({
  configFiles: config.configFiles || new NullConfigFileLoader(),
  modules: config.modules || new NullModuleLoader(),
});

export const getApp = (): Application => {
  const app = Application.getInstance();

  if (! app) {
    throw new Error('Application instance is not initialized. Please ensure you have called Application.setInstance(app) before accessing it.');
  }

  return app;
};
