import type { Application } from '@framework/core/app';
import type { IntentsBitField, PresenceData } from 'discord.js';
import type { RateLimiterInterface } from '#src/connection';

export interface DiscordConfig extends Record<string, unknown> {
  token: string;
  intents: IntentsBitField;
  richPresence: PresenceData;
  shardId: number;
  shardCount: number;
  rateLimiter: RateLimiterDriverInterface;
}

export interface RateLimiterDriverInterface {
  create(app: Application): Promise<RateLimiterInterface> | RateLimiterInterface;
}
