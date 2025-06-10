import type { IntentsBitField } from 'discord.js';

export interface DiscordConfig extends Record<string, unknown> {
  token: string;
  intents: IntentsBitField;
  shards?: number[];
  shardCount?: number;
}
