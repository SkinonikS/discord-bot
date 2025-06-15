import { importDefault } from '@poppinss/utils';
import type Application from '#/application';
import type { ModuleInterface, ModuleLoaderInterface } from '#/types';

export type ModuleResolver = (app: Application) => Promise<{ default: (new (...args: unknown[]) => ModuleInterface) | ModuleInterface }>;
export default class LazyModuleLoader implements ModuleLoaderInterface {
  public constructor(protected _resolvers: ModuleResolver[]) { }

  public load(app: Application): Promise<ModuleInterface[]> {
    const modules = this._resolvers.map(async (resolver) => {
      const Module = await importDefault(() => resolver(app));
      return Module instanceof Function ? new Module(app) : Module;
    });

    return Promise.all(modules);
  }
}
