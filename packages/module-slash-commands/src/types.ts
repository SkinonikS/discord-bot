import type { Application } from '@framework/core/app';
import type { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from '@module/discord/vendors/discordjs';

export interface SlashCommandInterface {
  readonly name: string;
  get metadata(): SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction): Promise<void>;
}

export interface RateLimiterInterface {
  hit(userId: Snowflake): Promise<RateLimitResponse> | RateLimitResponse;
}

export type RateLimitMessage = (app: Application, expiredTimestamp: number, locale: string) => Promise<string> | string;

export interface RateLimitResponse {
  isFirst: boolean;
  remaining: number;
  resetInMs: number;
}
