import type Application from '#/application';
import type { ModuleInterface, ModuleLoaderInterface } from '#/types';

export type ModuleResolver = (app: Application) => Promise<{ default: (new (...args: unknown[]) => ModuleInterface) | ModuleInterface }>;

export default class ImportModuleLoader implements ModuleLoaderInterface {
  public constructor(protected _resolvers: ModuleResolver[]) { }

  public load(app: Application): Promise<ModuleInterface[]> {
    const modules = this._resolvers.map(async (resolver) => {
      const { default: Module } = await resolver(app);
      if (Module instanceof Function) {
        return new Module(app);
      }
      return Module;
    });

    return Promise.all(modules);
  }
}
