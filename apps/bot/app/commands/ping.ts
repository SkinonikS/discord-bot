import type { SlashCommandInterface } from '@module/slash-commands';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export default class PingCommand implements SlashCommandInterface {
  public readonly name = 'ping';
  public readonly cooldown = 5;

  public build(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Replies with Pong!');
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({
      content: 'Pong!',
      flags: MessageFlags.Ephemeral,
    });
  }
}
