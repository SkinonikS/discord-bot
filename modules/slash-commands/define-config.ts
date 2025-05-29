import { defineConfig as defineBaseConfig } from '#core/application/config/define-config';
import { SlashCommandConfig } from '#modules/slash-commands/types';

export const defineConfig = (config: Partial<SlashCommandConfig>) => defineBaseConfig<SlashCommandConfig>('slash-commands', {
  commands: config.commands ?? [],
  ...config,
} as SlashCommandConfig);
