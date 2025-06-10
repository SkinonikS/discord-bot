import type { CommandsLoaderInterface } from '#/types';

export default class NullCommandsLoader implements CommandsLoaderInterface {
  public async load() {
    return [];
  }
}
