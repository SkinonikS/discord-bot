import { defineBaseConfig } from '@package/framework';
import type { SlashCommandConfig } from '#/types';

export const defineSlashCommandsConfig = (config: Partial<SlashCommandConfig>) => defineBaseConfig<SlashCommandConfig>('slash-commands', {
  commands: config.commands ?? [],
});
