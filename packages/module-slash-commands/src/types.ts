import type { BaseResolver } from '@framework/core';
import type { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export type SlashCommandResolver = BaseResolver<new () => SlashCommandInterface>;

export interface SlashCommandInterface {
  readonly name: string;
  readonly cooldown: number;
  get metadata(): SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

export interface SlashCommandConfig extends Record<string, unknown> {
  commands: SlashCommandResolver[];
}
