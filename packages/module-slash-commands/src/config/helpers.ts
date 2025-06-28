import { defineBaseConfig } from '@framework/core/config';
import type { SlashCommandConfig } from '#src/config/types';

export const defineSlashCommandsConfig = (config: Partial<SlashCommandConfig>) => defineBaseConfig<SlashCommandConfig>('slash-commands', {
  commands: config.commands ?? [],
});
