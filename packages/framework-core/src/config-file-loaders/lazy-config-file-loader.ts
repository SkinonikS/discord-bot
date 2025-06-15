import { importDefault } from '@poppinss/utils';
import type Application from '#/application';
import type { BaseConfig, ConfigFilesLoaderInterface } from '#/types';

export type ConfigFileResolver<T extends Record<string, unknown> = Record<string, unknown>> = (app: Application) => Promise<{ default: BaseConfig<T> } | BaseConfig<T>>;
export default class LazyConfigFileLoader implements ConfigFilesLoaderInterface {
  constructor(protected _resolvers: ConfigFileResolver[]) {}

  public load(app: Application): Promise<BaseConfig<Record<string, unknown>>[]> {
    const modules = this._resolvers.map(async (resolver) => {
      return importDefault(() => resolver(app));
    });

    return Promise.all(modules);
  }
}
