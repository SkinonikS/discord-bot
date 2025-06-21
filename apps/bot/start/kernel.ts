import type { Application, KernelConfig } from '@framework/core';
import { Kernel } from '@framework/core';

export const createKernel = async (app: Application, config: KernelConfig): Promise<Kernel> => {
  await app.register([
    () => import('@module/logger/module'),
  ]);

  const kernel = new Kernel(app);

  await kernel.bootstrapWith([
    () => import('@framework/core/bootstrappers/load-environment-variables').then((m) => new m.default(() => import('#bootstrap/env'))),
    () => import('@framework/core/bootstrappers/load-configuration').then((m) => new m.default(config.configFiles)),
    () => import('@framework/core/bootstrappers/handle-errors'),
    () => import('@framework/core/bootstrappers/register-modules').then((m) => new m.default(config.modules)),
    () => import('@framework/core/bootstrappers/boot-modules'),
  ]);

  return kernel;
};
