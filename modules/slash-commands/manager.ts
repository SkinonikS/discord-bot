import { ChatInputCommandInteraction, Client, Collection, Routes } from 'discord.js';
import { SlashCommandInterface, SlashCommandResolver } from '#modules/slash-commands/types';
import { Application } from '#core/application/application';
import { LoggerInterface } from '#core/application/types';

export default class SlashCommandManager {
  public readonly commands = new Collection<string, SlashCommandInterface>();

  public constructor(
    protected readonly _app: Application,
    protected readonly _discord: Client,
    protected readonly _logger: LoggerInterface,
  ) {
    //
  }

  public async load(commandResolvers: SlashCommandResolver[]): Promise<void> {
    for (const commandResolver of commandResolvers) {
      const Command = (await commandResolver()).default;
      const command = this._app.container.get(Command);
      this.commands.set(command.name, command);
      this._logger.debug(`Loaded command: ${command.name}`);
    }
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this.commands.get(interaction.commandName);

    if (! command) {
      this._logger.warn(`Unknown command: ${interaction.commandName}`);
      return;
    }

    await command.execute(interaction);
  }

  public async register(): Promise<void> {
    if (! this._discord.isReady()) {
      this._logger.warn('Discord client is not ready, cannot register slash commands.');
      return;
    }

    this._logger.debug(`Registering ${this.commands.size.toString()} commands...`);

    await this._discord.rest.put(
      Routes.applicationCommands(this._discord.application.id),
      {
        body: this.commands.map((command) => command.build().toJSON()),
      },
    );
  }
}
