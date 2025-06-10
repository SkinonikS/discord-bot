import { Kernel, LazyBootstrapperLoader, LazyModuleLoader } from '@package/framework';
import type { Application } from '@package/framework';

export const createKernel = async (app: Application): Promise<Kernel> => {
  await app.register(new LazyModuleLoader([
    () => import('@package/module-logger/module'),
  ]));

  return new Kernel(app, new LazyBootstrapperLoader([
    () => import('@package/framework/bootstrappers/load-environment-variables').then(({ default: LoadEnvironmentVariables }) => {
      return new LoadEnvironmentVariables(() => import('#bootstrap/env'));
    }),
    () => import('@package/framework/bootstrappers/load-configuration').then(({ default: LoadConfiguration }) => {
      return new LoadConfiguration(() => import('#bootstrap/kernel'));
    }),
    () => import('@package/framework/bootstrappers/register-modules').then(({ default: RegisterModules }) => {
      return new RegisterModules(() => import('#bootstrap/kernel'));
    }),
    () => import('@package/framework/bootstrappers/boot-modules'),
  ]));
};
