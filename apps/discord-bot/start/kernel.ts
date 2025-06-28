import type { Application } from '@framework/core/app';
import type { KernelConfig } from '@framework/core/config';
import { Kernel } from '@framework/core/kernel';

export const createKernel = async (app: Application, config: KernelConfig): Promise<Kernel> => {
  await app.register([
    () => import('@module/logger/module'),
  ]);

  const kernel = new Kernel(app);

  await kernel.bootstrapWith([
    () => import('@framework/core/kernel/bootstrappers/load-environment-variables').then((m) => new m.default(() => import('#bootstrap/env'))),
    () => import('@framework/core/kernel/bootstrappers/load-configuration').then((m) => new m.default(config.configFiles)),
    () => import('@framework/core/kernel/bootstrappers/handle-errors'),
    () => import('@framework/core/kernel/bootstrappers/register-modules').then((m) => new m.default(config.modules)),
    () => import('@framework/core/kernel/bootstrappers/boot-modules'),
  ]);

  return kernel;
};
