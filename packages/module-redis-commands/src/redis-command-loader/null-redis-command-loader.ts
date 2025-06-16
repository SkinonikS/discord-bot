import type { RedisCommandInterface, RedisCommandLoaderInterface } from '#/types';

export default class NullCommandLoader implements RedisCommandLoaderInterface {
  public async load(): Promise<RedisCommandInterface[]> {
    return [];
  }
}
