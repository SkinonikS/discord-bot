import { Application, defineBaseConfig } from '@framework/core';
import { IntentsBitField, type Client } from 'discord.js';
import type { DiscordConfig } from '#/types';

export const getDiscordClient = async (app?: Application): Promise<Client> => {
  app ??= Application.getInstance();
  return app.container.make('discord.client');
};

export const defineDiscordConfig = (config: Partial<DiscordConfig>) => defineBaseConfig<DiscordConfig>('discord', {
  token: config.token ?? '',
  intents: config.intents ?? new IntentsBitField(),
  richPresence: config.richPresence ?? {},
  shardCount: config.shardCount ?? 1,
  shardId: config.shardId ?? 0,
  rateLimiter: config.rateLimiter ?? {
    maxConcurrency: 5,
    resetDuration: 5000,
    channelName: 'connection-rate-limit',
    database: 0,
  },
});
