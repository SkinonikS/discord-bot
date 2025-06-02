import type { Application } from '@package/framework';
import type { LoggerInterface } from '@package/module-logger';
import type { ChatInputCommandInteraction, Client } from 'discord.js';
import { Collection, MessageFlags, Routes } from 'discord.js';
import { DateTime } from 'luxon';
import type { SlashCommandInterface, SlashCommandResolver } from '#/types';

export default class SlashCommandManager {
  public readonly commands = new Collection<string, SlashCommandInterface>();
  public readonly cooldowns = new Collection<string, Collection<string, number>>();

  public constructor(
    protected readonly _app: Application,
    protected readonly _discord: Client,
    protected readonly _logger: LoggerInterface,
  ) {
    //
  }

  public async register(commandResolvers: (SlashCommandResolver | SlashCommandInterface)[]): Promise<void> {
    for (const commandResolver of commandResolvers) {
      let command: SlashCommandInterface;

      if (typeof commandResolver === 'function') {
        const Command = (await commandResolver()).default;
        command = await this._app.container.make(Command);
      } else {
        command = commandResolver as SlashCommandInterface;
      }

      this.commands.set(command.name, command);
      this._logger.debug(`Registered command: ${command.name}`);
    }

    this._logger.info(`Registered ${this.commands.size.toString()} slash commands.`);
  }

  public async interact(interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this.commands.get(interaction.commandName);

    if (! command) {
      throw new Error(`Unknown command: ${interaction.commandName}`);
    }

    if (! this.cooldowns.has(interaction.commandName)) {
      this.cooldowns.set(interaction.commandName, new Collection());
    }

    const now = DateTime.now().toMillis();
    const timestamps = this.cooldowns.get(command.name) as Collection<string, number>;
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

        return;
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    await command.execute(interaction);
  }

  public async deployToDiscord(): Promise<void> {
    if (! this._discord.isReady()) {
      throw new Error('Discord client is not ready. Cannot register slash commands.');
    }

    this._logger.debug(`Deploying ${this.commands.size.toString()} commands to Discord...`);

    await this._discord.rest.put(Routes.applicationCommands(this._discord.application.id), {
      body: this.commands.map((command) => command.build().toJSON()),
    });
  }
}
