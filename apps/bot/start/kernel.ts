import type { Application, KernelConfig } from '@framework/core';
import { RegisterModulesBootstrapper, BootModuleBootstrapper, HandleErrorsBootstrapper, Kernel, LoadConfigurationBootstrapper, LoadEnvironmentVariablesBootstrapper } from '@framework/core';

export const createKernel = async (app: Application, config: KernelConfig): Promise<Kernel> => {
  await app.register([
    () => import('@module/logger/module'),
  ]);

  const kernel = new Kernel(app);

  await kernel.bootstrapWith([
    new LoadEnvironmentVariablesBootstrapper(() => import('#bootstrap/env')),
    new LoadConfigurationBootstrapper(config.configFiles),
    new HandleErrorsBootstrapper(),
    new RegisterModulesBootstrapper(config.modules),
    new BootModuleBootstrapper(),
  ]);

  return kernel;
};
