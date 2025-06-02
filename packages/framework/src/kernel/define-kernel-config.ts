import type { KernelConfig } from '#/types';

export const defineKernelConfig = (config: Partial<KernelConfig>): KernelConfig => {
  config.configFiles = config.configFiles || [];
  config.serviceProviders = config.serviceProviders || [];
  return config as KernelConfig;
};
