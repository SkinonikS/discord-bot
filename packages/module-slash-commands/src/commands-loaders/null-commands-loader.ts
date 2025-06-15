import type { CommandsLoaderInterface, SlashCommandInterface } from '#/types';

export default class NullCommandsLoader implements CommandsLoaderInterface {
  public async load(): Promise<SlashCommandInterface[]> {
    return [];
  }
}
