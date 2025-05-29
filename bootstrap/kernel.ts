import { Application } from '#core/application/application';
import { Kernel } from '#core/kernel/kernel';
import path from 'node:path';

const app = new Application(
  path.resolve(import.meta.dirname, '..'),
);

await app.registerServiceProvider([
  () => import('#core/application/logger/service-provider'),
]);

const kernel = new Kernel(app);

kernel.use([
  () => import('#core/kernel/bootstrappers/load-environment-variables'),
  () => import('#core/kernel/bootstrappers/load-configuration'),
  () => import('#core/kernel/bootstrappers/register-service-providers'),
  () => import('#core/kernel/bootstrappers/boot-service-providers'),
]);

export default kernel;
