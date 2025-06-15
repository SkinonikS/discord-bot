import { defineBaseConfig } from '@framework/core';
import NullCommandLoader from '#/command-loaders/null-command-loader';
import type { SlashCommandConfig } from '#/types';

export const defineSlashCommandsConfig = (config: Partial<SlashCommandConfig>) => defineBaseConfig<SlashCommandConfig>('slash-commands', {
  commands: config.commands ?? new NullCommandLoader(),
});
