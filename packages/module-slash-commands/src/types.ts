import type { Application } from '@package/framework';
import type { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';

export type SlashCommandResolver = () => Promise<{ default: new (...args: unknown[]) => SlashCommandInterface }>;

export interface SlashCommandInterface {
  readonly name: string;
  readonly cooldown: number;
  build(): SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

export interface SlashCommandConfig extends Record<string, unknown> {
  commands: CommandsLoaderInterface;
}

export interface CommandsLoaderInterface {
  load(app: Application): Promise<SlashCommandInterface[]>;
}
