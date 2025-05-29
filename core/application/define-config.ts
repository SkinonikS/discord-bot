import { ConfigResolver, ServiceProviderResolver } from '#core/application/types';

export interface DefineConfig {
  serviceProviders: ServiceProviderResolver[];
  configFiles: ConfigResolver[];
}

export const defineConfig = (config: Partial<DefineConfig>): DefineConfig => {
  config.serviceProviders ??= [];
  config.configFiles ??= [];

  return config as DefineConfig;
};
