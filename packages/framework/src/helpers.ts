import NullConfigFileLoader from '#/config-file-loaders/null-config-file-loader';
import NullModuleLoader from '#/module-loaders/null-module-loader';
import type { BaseConfig, KernelConfig } from '#/types';

export const defineBaseConfig = <T extends Record<string, unknown>>(key: string, config: T): BaseConfig<T> => ({
  key,
  config,
});

export const defineKernelConfig = (config: Partial<KernelConfig>): KernelConfig => ({
  configFiles: config.configFiles || new NullConfigFileLoader(),
  modules: config.modules || new NullModuleLoader(),
});
