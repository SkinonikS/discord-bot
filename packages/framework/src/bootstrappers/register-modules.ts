import type Application from '#/application';
import type { KernelConfigResolver, BootstrapperInterface } from '#/types';

export default class RegisterModules implements BootstrapperInterface {
  public constructor(
    protected readonly _kernelConfigResolver: KernelConfigResolver,
  ) {
    //
  }

  public async bootstrap(app: Application): Promise<void> {
    const appConfig = (await this._kernelConfigResolver()).default;
    await app.register(appConfig.modules);
  }
}
