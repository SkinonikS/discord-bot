import path from 'node:path';
import { Kernel, Application } from '@package/framework';

const app = new Application(
  path.resolve(import.meta.dirname, '..'),
);
Application.setInstance(app);

await app.registerServiceProvider([
  () => import('@package/module-logger/service-provider'),
]);

const kernel = new Kernel(app);

kernel.use([
  () => import('@package/framework/kernel/bootstrappers/load-environment-variables').then(({ default: T }) => {
    return new T(() => import('#bootstrap/env'));
  }),
  () => import('@package/framework/kernel/bootstrappers/load-configuration').then(({ default: T }) => {
    return new T(() => import('#bootstrap/kernel'));
  }),
  () => import('@package/framework/kernel/bootstrappers/register-service-providers').then(({ default: T }) => {
    return new T(() => import('#bootstrap/kernel'));
  }),
  () => import('@package/framework/kernel/bootstrappers/boot-service-providers'),
]);

export default kernel;
