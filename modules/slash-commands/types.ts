import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export type SlashCommandResolver = () => Promise<{ default: new () => SlashCommandInterface }>;

export interface SlashCommandInterface {
  readonly name: string;
  build(): SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface SlashCommandConfig {
  commands: SlashCommandResolver[];
}
