import type { CommandsLoaderInterface, SlashCommandInterface } from '#/types';

export default class NullCommandLoader implements CommandsLoaderInterface {
  public async load(): Promise<SlashCommandInterface[]> {
    return [];
  }
}
