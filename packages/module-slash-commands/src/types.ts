import type { Result } from '@framework/core/vendors/neverthrow';
import type { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from '@module/discord/vendors/discordjs';

export interface SlashCommandInterface {
  readonly name: string;
  get metadata(): SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<Result<void, Error>>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<Result<void, Error>>;
}

export interface RateLimiterInterface {
  hit(userId: Snowflake): Promise<Result<RateLimitResponse, Error>> | Result<RateLimitResponse, Error>;
}

export interface RateLimitResponse {
  isFirst: boolean;
  remaining: number;
  resetInMs: number;
}
