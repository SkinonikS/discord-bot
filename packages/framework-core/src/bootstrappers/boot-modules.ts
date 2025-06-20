import type Application from '#/application';
import type { BootstrapperInterface } from '#/types';

export default class BootModulesBootstrapper implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void> {
    await app.boot();
  }
}
