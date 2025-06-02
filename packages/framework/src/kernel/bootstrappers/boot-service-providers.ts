import type { BootstrapperInterface } from '#/types';
import type { Application } from '#application/application';

export default class BootServiceProviders implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void>{
    await app.boot();
  }
}
