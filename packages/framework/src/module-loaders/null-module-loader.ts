import type { ModuleInterface, ModuleLoaderInterface } from '#/types';

export default class NullModuleLoader implements ModuleLoaderInterface {
  public async load(): Promise<ModuleInterface[]> {
    return [];
  }
}
