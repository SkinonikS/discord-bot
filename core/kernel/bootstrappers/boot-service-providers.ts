import { Application } from '#core/application/application';
import { BootstrapperInterface } from '#core/kernel/types';

export default class BootServiceProviders implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void>{
    await app.boot();
  }
}
