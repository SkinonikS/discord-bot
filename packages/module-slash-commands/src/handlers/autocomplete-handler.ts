import type { AutocompleteInteraction } from '@module/discord/vendors/discordjs';
import type { LoggerInterface } from '@module/logger';
import type Manager from '#src/manager';

export default class AutocompleteHandler {
  public constructor(
    protected readonly _manager: Manager,
    protected readonly _logger: LoggerInterface,
  ) { }

  public async handle(interaction: AutocompleteInteraction): Promise<void> {
    const command = this._manager.getCommand(interaction.commandName);
    if (! command) {
      this._logger.warn(`Slash-command not found: ${interaction.commandName}.`);
      return;
    }

    if (! command.autocomplete) {
      return;
    }

    await command.autocomplete(interaction);
  }
}
