import type { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from 'discord.js';
import type { Result } from 'neverthrow';

export interface SlashCommandInterface {
  readonly name: string;
  get metadata(): SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<Result<void, Error>> | Result<void, Error>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<Result<void, Error>> | Result<void, Error>;
}

export interface RateLimiterInterface {
  setup(): Promise<Result<void, Error>> | Result<void, Error>;
  dispose(): Promise<Result<void, Error>> | Result<void, Error>;
  hit(userId: Snowflake): Promise<Result<RateLimitResponse, Error>>  | Result<RateLimitResponse, Error>;
}

export interface RateLimitResponse {
  isFirst: boolean;
  remaining: number;
  resetInMs: number;
}
