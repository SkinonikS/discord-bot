import type { Application } from '@framework/core';
import type { LoggerInterface } from '@module/logger';
import { type AutocompleteInteraction, type ChatInputCommandInteraction, type Client, type Guild, Collection, MessageFlags } from 'discord.js';
import { DateTime } from 'luxon';
import type { CommandsLoaderInterface, SlashCommandInterface } from '#/types';

export default class SlashCommandManager {
  protected readonly _commands = new Collection<string, SlashCommandInterface>();
  protected readonly _cooldowns: Collection<string, Collection<string, number>> = new Collection();

  public constructor(
    protected readonly _app: Application,
    protected readonly _discord: Client,
    protected readonly _logger: LoggerInterface,
  ) {
    //
  }

  public async register(commandsLoader: CommandsLoaderInterface): Promise<void> {
    const commands = await commandsLoader.load(this._app);

    for (const command of commands) {
      this._commands.set(command.name, command);
      this._logger.debug(`Registered command: ${command.name}`);
    }
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this._commands.get(interaction.commandName);

    if (! command) {
      this._logger.warn(`Unknown command: ${interaction.commandName}`);
      return;
    }

    if (! this._cooldowns.has(command.name)) {
      this._cooldowns.set(command.name, new Collection());
    }

    const now = DateTime.now().toMillis();
    const timestamps: Collection<string, number> = this._cooldowns.get(command.name) ?? new Collection();
    const cooldownAmount = command.cooldown * 1_000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime = (timestamps.get(interaction.user.id) ?? 0) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);

        await interaction.reply({
          // TODO: Add localization support for this message
          content: `Please wait, you are on a cooldown for \`${command.name}\`. You can use it again <t:${expiredTimestamp}:T>.`,
          flags: MessageFlags.Ephemeral,
        });

        this._logger.debug(`User ${interaction.user.tag} (${interaction.user.id}) tried to use command ${command.name} on cooldown.`);
        return;
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    await command.execute(interaction);
    this._logger.debug(`Executed command: ${command.name} for user: ${interaction.user.tag} (${interaction.user.id})`);
  }

  public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const command = this._commands.get(interaction.commandName);

    if (! command) {
      this._logger.warn(`Unknown command: ${interaction.commandName}`);
      return;
    }

    if (command.autocomplete) {
      await command.autocomplete(interaction);
    }
  }

  public async deployToGuilds(guilds: Guild[]): Promise<void> {
    if (! this._discord.isReady()) {
      this._logger.warn('Discord client is not ready. Cannot deploy commands.');
      return;
    }

    for (const guild of guilds) {
      await guild.commands.set(this._commands.map((command) => command.build()));
      this._logger.debug(`Deployed commands to guild: ${guild.name} (${guild.id})`);
    }

    this._logger.info(`Deployed ${this._commands.size} commands to ${guilds.length} guild(s)`);
  }
}
