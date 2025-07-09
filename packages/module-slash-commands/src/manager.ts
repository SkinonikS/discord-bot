import type { Application } from '@framework/core/app';
import { importModule, ImportNotFoundException, instantiateIfNeeded } from '@framework/core/utils';
import type { Exception } from '@framework/core/vendors/exceptions';
import { err, fromPromise, ok } from '@framework/core/vendors/neverthrow';
import type { Result } from '@framework/core/vendors/neverthrow';
import { InteractionReplyException } from '@module/discord';
import type { AutocompleteInteraction, ChatInputCommandInteraction, Client, Guild } from '@module/discord/vendors/discordjs';
import { Collection, MessageFlags } from '@module/discord/vendors/discordjs';
import type { LoggerInterface } from '@module/logger';
import { DateTime } from 'luxon';
import type { SlashCommandResolver } from '#src/config/types';
import { DiscordClientNotReadyException, RateLimitExceededException, CommandNotFoundException, RateLimitRetrievalException } from '#src/exceptions';
import type { RateLimiterInterface, RateLimitMessage, SlashCommandInterface } from '#src/types';

export default class Manager {
  protected readonly _commands = new Collection<string, SlashCommandInterface>();

  public constructor(
    protected readonly _app: Application,
    protected readonly _discord: Client,
    protected readonly _rateLimiter: RateLimiterInterface,
    protected readonly _logger: LoggerInterface,
    protected readonly _rateLimitMessage: RateLimitMessage,
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

  public async execute(interaction: ChatInputCommandInteraction): Promise<Result<true, Exception>> {
    const command = this._commands.get(interaction.commandName);

    if (! command) {
      this._logger.warn(`Unknown command: ${interaction.commandName}`);
      return err(new CommandNotFoundException(interaction.commandName));
    }

    const rateLimitResult = await this._rateLimiter.hit(interaction.user.id);
    if (rateLimitResult.isErr()) {
      this._logger.debug(`Failed to get rate limits for user ${interaction.user.id}: ${rateLimitResult.error.message}`);
      return err(new RateLimitRetrievalException(command.name, interaction.user.id, rateLimitResult.error));
    }

    if (! rateLimitResult.value.isFirst && rateLimitResult.value.remaining <= 0) {
      const expiredTimestamp = Math.round(DateTime.now().plus({ millisecond: rateLimitResult.value.resetInMs }).toSeconds());
      const message = await this._rateLimitMessage(this._app, expiredTimestamp, interaction.locale);

      const rateLimitReplyResult = await fromPromise(interaction.reply({
        content: message,
        flags: MessageFlags.Ephemeral,
      }), (e) => new InteractionReplyException(interaction.id, e));

      if (rateLimitReplyResult.isErr()) {
        this._logger.error({ ...rateLimitReplyResult.error, command: command.name, user: interaction.user.id });
        return err(rateLimitReplyResult.error);
      }

      this._logger.debug(`User ${interaction.user.tag} (${interaction.user.id}) is rate limited for command: ${command.name}`);
      return err(new RateLimitExceededException(interaction.user.id, command.name));
    }

    const executeResult = await command.execute(interaction);
    if (executeResult.isErr()) {
      this._logger.error({ error: executeResult.error, command: command.name, user: interaction.user.id });
      return err(executeResult.error);
    }

    this._logger.debug(`Executed command: ${command.name} for user: ${interaction.user.tag} (${interaction.user.id})`);
    return ok(true);
  }

  public async autocomplete(interaction: AutocompleteInteraction): Promise<Result<void, Exception>> {
    const command = this._commands.get(interaction.commandName);

    if (! command) {
      this._logger.warn(`Unknown command: ${interaction.commandName}`);
      return err(new CommandNotFoundException(interaction.commandName));
    }

    if (command.autocomplete) {
      const autocompleteResult = await command.autocomplete(interaction);
      if (autocompleteResult.isErr()) {
        this._logger.error({ error: autocompleteResult.error, command: command.name, user: interaction.user.id });
        return err(autocompleteResult.error);
      }
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
