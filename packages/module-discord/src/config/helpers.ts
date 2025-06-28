import { defineBaseConfig } from '@framework/core/config';
import { IntentsBitField } from 'discord.js';
import NullRateLimiterDriver from '#src/config/rate-limiter-drivers/null-rate-limiter-driver';
import type { DiscordConfig } from '#src/config/types';

export const defineDiscordConfig = (config: Partial<DiscordConfig>) => defineBaseConfig<DiscordConfig>('discord', {
  token: config.token ?? '',
  intents: config.intents ?? new IntentsBitField(),
  richPresence: config.richPresence ?? {},
  shardCount: config.shardCount ?? 1,
  shardId: config.shardId ?? 0,
  rateLimiter: config.rateLimiter ?? new NullRateLimiterDriver(),
});
