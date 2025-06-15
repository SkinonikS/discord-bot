import type Application from '#/application';
import type { BootstrapperInterface, BootstrapperLoaderInterface } from '#/types';

export type BootstrapperResolver = (app: Application) => Promise<{ default: new () => BootstrapperInterface } | BootstrapperInterface>;
export default class LazyBootstrapperLoader implements BootstrapperLoaderInterface {
  public constructor(protected _resolvers: BootstrapperResolver[]) { }

  public load(app: Application): Promise<BootstrapperInterface[]> {
    const modules = this._resolvers.map(async (resolver) => {
      const nodeModule = await resolver(app);
      if ('default' in nodeModule) {
        return new nodeModule.default();
      }
      return nodeModule;
    });

    return Promise.all(modules);
  }
}
