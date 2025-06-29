import type { Application } from '@framework/core/app';
import { importModule, ImportNotFoundException, instantiateIfNeeded } from '@framework/core/utils';
import type { LoggerInterface } from '@module/logger';
import { Collection, MessageFlags } from 'discord.js';
import type { AutocompleteInteraction, ChatInputCommandInteraction, Client, Guild } from 'discord.js';
import { DateTime } from 'luxon';
import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { SlashCommandResolver } from '#src/config/types';
import { DiscordClientNotReadyException, SlashCommandCooldownException, SlashCommandNotFoundException } from '#src/exceptions';
import type { RateLimiterInterface, SlashCommandInterface } from '#src/types';

export default class Manager {
  protected readonly _commands = new Collection<string, SlashCommandInterface>();
  protected readonly _cooldowns: Collection<string, Collection<string, number>> = new Collection();

  public constructor(
    protected readonly _app: Application,
    protected readonly _discord: Client,
    protected readonly _rateLimiter: RateLimiterInterface,
    protected readonly _logger: LoggerInterface,
  ) {
    //
  }

  public async register(slashCommands: SlashCommandResolver[]): Promise<void> {
    for (const slashCommandResolver of slashCommands) {
      try {
        const resolvedCommand = await importModule(() => slashCommandResolver());
        const command = await instantiateIfNeeded(resolvedCommand, this._app);

        this._commands.set(command.name, command);
        this._logger.debug(`Registered slash command: ${command.name}`);
      } catch (e) {
        if (e instanceof ImportNotFoundException) {
          this._logger.error(e as ImportNotFoundException);
          continue;
        }

        throw e;
      }
    }
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<Result<void, Error>> {
    const command = this._commands.get(interaction.commandName);

    if (! command) {
      this._logger.warn(`Unknown command: ${interaction.commandName}`);
      return err(new SlashCommandNotFoundException(interaction.commandName));
    }

    const rateLimitResult = await this._rateLimiter.hit(interaction.user.id);
    if (rateLimitResult.isErr()) {
      this._logger.debug(`Failed to get rate limits for user ${interaction.user.id}: ${rateLimitResult.error.message}`);
      return err(rateLimitResult.error);
    }

    if (! rateLimitResult.value.isFirst && rateLimitResult.value.remaining <= 0) {
      const expiredTimestamp = Math.round(DateTime.now().plus({ millisecond: rateLimitResult.value.resetInMs }).toSeconds());

      await interaction.reply({
        // TODO: Add localization support for this message
        content: `Please wait, you are on a cooldown for \`${command.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
        flags: MessageFlags.Ephemeral,
      });

      this._logger.debug(`User ${interaction.user.tag} (${interaction.user.id}) is rate limited for command: ${command.name}`);
      return err(new SlashCommandCooldownException(interaction.user.id, command.name));
    }

    const executeResult = await command.execute(interaction);
    if (executeResult.isErr()) {
      this._logger.error(executeResult.error);
      return err(executeResult.error);
    }

    this._logger.debug(`Executed command: ${command.name} for user: ${interaction.user.tag} (${interaction.user.id})`);
    return ok();
  }

  public async autocomplete(interaction: AutocompleteInteraction): Promise<Result<void, Error>> {
    const command = this._commands.get(interaction.commandName);

    if (! command) {
      this._logger.warn(`Unknown command: ${interaction.commandName}`);
      return err(new SlashCommandNotFoundException(interaction.commandName));
    }

    if (command.autocomplete) {
      await command.autocomplete(interaction);
    } else {
      this._logger.debug(`No autocomplete handler for command '${command.name}', skipping...`);
    }

    return ok();
  }

  public async deployToGuilds(guilds: Guild[]): Promise<Result<void, Error>> {
    if (! this._discord.isReady()) {
      this._logger.warn('Discord client is not ready. Did you forget wrap it in a ready event?');
      return err(new DiscordClientNotReadyException());
    }

    for (const guild of guilds) {
      await guild.commands.set(this._commands.map((command) => command.metadata));
      this._logger.debug(`Deployed commands to guild: ${guild.name} (${guild.id})`);
    }

    this._logger.info(`Deployed ${this._commands.size} commands to ${guilds.length} guild(s)`);
    return ok();
  }
}
