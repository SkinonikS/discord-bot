import type { Application } from '@framework/core/app';
import { ImportNotFoundException } from '@framework/core/utils';
import { importModule, instantiateIfNeeded } from '@framework/core/utils';
import { RuntimeException } from '@framework/core/vendors/exceptions';
import type { Client, Guild } from '@module/discord/vendors/discordjs';
import { Collection } from '@module/discord/vendors/discordjs';
import type { LoggerInterface } from '@module/logger';
import type { SlashCommandResolver } from '#src/config/types';
import type { SlashCommandInterface } from '#src/types';

export default class Manager {
  protected readonly _commands = new Collection<string, SlashCommandInterface>();

  public constructor(
    protected readonly _app: Application,
    protected readonly _discord: Client,
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
        this._logger.debug(`Registered slash-command: ${command.name}.`);
      } catch (e) {
        if (e instanceof ImportNotFoundException) {
          this._logger.warn({ err: e }, `Failed to import slash command: ${slashCommandResolver.name}.`);
          continue;
        }

        throw e;
      }
    }
  }

  public getCommand(name: string): SlashCommandInterface | undefined {
    return this._commands.get(name);
  }

  public async deployToGuilds(guilds: Guild[]): Promise<void> {
    if (! this._discord.isReady()) {
      throw new RuntimeException('Discord client is not ready. Cannot deploy slash commands.');
    }

    for (const guild of guilds) {
      try {
        await guild.commands.set(this._commands.map((command) => command.metadata));
      } catch (e) {
        this._logger.error({ err: e }, `Failed to deploy commands to guild ${guild.name} (${guild.id})`);
      }
    }

    this._logger.info(`Deployed ${this._commands.size} commands to ${guilds.length} guild(s)`);
  }
}
