import { Application, defineBaseConfig } from '@framework/core';
import type SlashCommandManager from '#/slash-command-manager';
import type { SlashCommandConfig } from '#/types';

export const getSlashCommandManager = (app?: Application): Promise<SlashCommandManager> => {
  app = app ?? Application.getInstance();
  return app.container.make('slash-commands');
};

export const defineSlashCommandsConfig = (config: Partial<SlashCommandConfig>) => defineBaseConfig<SlashCommandConfig>('slash-commands', {
  commands: config.commands ?? [],
});
