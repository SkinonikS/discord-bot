import type { BootstrapperInterface, BootstrapperLoaderInterface } from '#/types';

export default class NullBootstrapperLoader implements BootstrapperLoaderInterface {
  public async load(): Promise<BootstrapperInterface[]> {
    return [];
  }
}
