import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export type SlashCommandResolver = () => Promise<{ default: new () => SlashCommandInterface }>;

export interface SlashCommandInterface {
  readonly name: string;
  readonly cooldown: number;
  build(): SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface SlashCommandConfig extends Record<string, unknown> {
  commands: SlashCommandResolver[];
}
