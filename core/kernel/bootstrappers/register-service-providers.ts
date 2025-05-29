import { Application } from '#core/application/application';
import { BootstrapperInterface } from '#core/kernel/types';

export default class RegisterServiceProviders implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void> {
    const { default: appConfig } = await import('#bootstrap/app');

    await app.registerServiceProvider(appConfig.serviceProviders);
  }
}
