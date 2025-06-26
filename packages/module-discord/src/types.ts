import type { IntentsBitField, PresenceData } from 'discord.js';

export interface DiscordConfig extends Record<string, unknown> {
  token: string;
  intents: IntentsBitField;
  richPresence: PresenceData;
  shardId: number;
  shardCount: number;
  rateLimiter: {
    maxConcurrency: number;
    channelName: string;
    resetDuration: number;
    database: number;
  };
}

export interface LoadBalancerInterface {
  register(): Promise<void>;
  unregister(): Promise<void>;
  execute(callback: (uid: string, shardId?: number) => Promise<void>): Promise<void>;
}
