import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { SlashCommandInterface } from '#modules/slash-commands/types';

export default class PingCommand implements SlashCommandInterface {
  public readonly name = 'ping';

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
