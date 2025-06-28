import type { KernelConfig, BaseConfig } from '#src/config/types';

export const defineBaseConfig = <T>(key: string, config: T): BaseConfig<T> => ({
  key,
  config,
});

export const defineKernelConfig = (config: Partial<KernelConfig>): KernelConfig => ({
  configFiles: config.configFiles || [],
  modules: config.modules || [],
});
