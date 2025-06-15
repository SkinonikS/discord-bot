import { importDefault } from '@poppinss/utils';
import type Application from '#/application';
import type { BootstrapperInterface, BootstrapperLoaderInterface } from '#/types';

export type BootstrapperResolver = (app: Application) => Promise<{ default: (new () => BootstrapperInterface) | BootstrapperInterface }>;
export default class LazyBootstrapperLoader implements BootstrapperLoaderInterface {
  public constructor(protected _resolvers: BootstrapperResolver[]) { }

  public async load(app: Application): Promise<BootstrapperInterface[]> {
    const modules = this._resolvers.map(async (resolver) => {
      const Bootstrapper = await importDefault(() => resolver(app));
      return Bootstrapper instanceof Function ? app.container.make(Bootstrapper) : Bootstrapper;
    });

    return Promise.all(modules);
  }
}
