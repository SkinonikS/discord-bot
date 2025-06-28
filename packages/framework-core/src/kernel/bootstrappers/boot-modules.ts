import type Application from '#src/app/application';
import type { BootstrapperInterface } from '#src/kernel/types';

export default class BootModules implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void> {
    await app.boot();
  }
}
