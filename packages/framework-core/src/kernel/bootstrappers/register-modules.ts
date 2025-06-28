import type Application from '#src/app/application';
import type { ModuleResolver } from '#src/config/types';
import type { BootstrapperInterface } from '#src/kernel/types';

export default class RegisterModules implements BootstrapperInterface {
  public constructor(protected readonly _modules: ModuleResolver[]) { }

  public async bootstrap(app: Application): Promise<void> {
    await app.register(this._modules);
  }
}
