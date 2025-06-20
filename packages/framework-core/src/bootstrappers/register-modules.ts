import type Application from '#/application';
import type { BootstrapperInterface, ModuleResolver } from '#/types';

export default class RegisterModulesBootstrapper implements BootstrapperInterface {
  public constructor(protected readonly _modules: ModuleResolver[]) { }

  public async bootstrap(app: Application): Promise<void> {
    await app.register(this._modules);
  }
}
