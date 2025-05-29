import { defineConfig as defineBaseConfig } from '#core/application/config/define-config';
import { DiscordConfig } from '#modules/discord/types';
import { IntentsBitField } from 'discord.js';

export const defineConfig = (config: Partial<DiscordConfig>) => defineBaseConfig<DiscordConfig>('discord', {
  token: config.token ?? '',
  clientId: config.clientId ?? '',
  intents: config.intents ?? new IntentsBitField(),
  ...config,
} as DiscordConfig);
