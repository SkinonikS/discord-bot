import { Kernel, LazyBootstrapperLoader, LazyModuleLoader, type Application } from '@framework/core';

export const createKernel = async (app: Application): Promise<Kernel> => {
  await app.register(new LazyModuleLoader([
    () => import('@module/logger/module'),
  ]));

  return new Kernel(app, new LazyBootstrapperLoader([
    () => import('@framework/core/bootstrappers/load-environment-variables').then(({ default: LoadEnvironmentVariables }) => {
      return new LoadEnvironmentVariables(() => import('#bootstrap/env'));
    }),
    () => import('@framework/core/bootstrappers/load-configuration').then(({ default: LoadConfiguration }) => {
      return new LoadConfiguration(() => import('#bootstrap/kernel'));
    }),
    () => import('@framework/core/bootstrappers/register-modules').then(({ default: RegisterModules }) => {
      return new RegisterModules(() => import('#bootstrap/kernel'));
    }),
    () => import('@framework/core/bootstrappers/boot-modules'),
  ]));
};
