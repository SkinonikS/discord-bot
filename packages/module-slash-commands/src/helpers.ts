import { defineBaseConfig } from '@package/framework';
import NullCommandsLoader from '#/commands-loaders/null-commands-loader';
import type { SlashCommandConfig } from '#/types';

export const defineSlashCommandsConfig = (config: Partial<SlashCommandConfig>) => defineBaseConfig<SlashCommandConfig>('slash-commands', {
  commands: config.commands ?? new NullCommandsLoader(),
});
