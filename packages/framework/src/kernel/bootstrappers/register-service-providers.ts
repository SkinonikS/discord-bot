import type { KernelConfigResolver, BootstrapperInterface } from '#/types';
import type { Application } from '#application/application';

export default class RegisterServiceProviders implements BootstrapperInterface {
  public constructor(
    protected readonly _loadKernelConfig: KernelConfigResolver,
  ) {
    //
  }

  public async bootstrap(app: Application): Promise<void> {
    const appConfig = (await this._loadKernelConfig()).default;
    await app.registerServiceProvider(appConfig.serviceProviders);
  }
}
