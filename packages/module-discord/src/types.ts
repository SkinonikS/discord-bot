import type { IntentsBitField, PresenceData } from 'discord.js';

export interface DiscordConfig extends Record<string, unknown> {
  token: string;
  intents: IntentsBitField;
  richPresence?: PresenceData;
  shards?: number[];
  shardCount?: number;
}
