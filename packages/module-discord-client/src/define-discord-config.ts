import { defineBaseConfig } from '@package/framework';
import { IntentsBitField } from 'discord.js';
import type { DiscordConfig } from '#/types';

export const defineDiscordConfig = (config: Partial<DiscordConfig>) => defineBaseConfig<DiscordConfig>('discord', {
  token: config.token ?? '',
  intents: config.intents ?? new IntentsBitField(),
});
