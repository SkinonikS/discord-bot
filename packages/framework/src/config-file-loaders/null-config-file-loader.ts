import type { ConfigFilesLoaderInterface, BaseConfig } from '#/types';

export default class NullConfigFileLoader implements ConfigFilesLoaderInterface {
  public async load(): Promise<BaseConfig<Record<string, unknown>>[]> {
    return [];
  }
}
