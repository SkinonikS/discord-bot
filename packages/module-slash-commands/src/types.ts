import type { Application } from '@framework/core/app';
import type { Exception } from '@framework/core/vendors/exceptions';
import type { Result } from '@framework/core/vendors/neverthrow';
import type { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from '@module/discord/vendors/discordjs';

export interface SlashCommandInterface {
  readonly name: string;
  get metadata(): SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<Result<true, Exception>>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<Result<true, Exception>>;
}

export interface RateLimiterInterface {
  hit(userId: Snowflake): Promise<Result<RateLimitResponse, Error>> | Result<RateLimitResponse, Error>;
}

export type RateLimitMessage = (app: Application, expiredTimestamp: number, locale: string) => Promise<string> | string;

export interface RateLimitResponse {
  isFirst: boolean;
  remaining: number;
  resetInMs: number;
}
