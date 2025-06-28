import { Application } from '@framework/core/app';
import type SlashCommandManager from '#src/slash-command-manager';

export const getSlashCommandManager = (app?: Application): Promise<SlashCommandManager> => {
  app = app ?? Application.getInstance();
  return app.container.make('slash-commands');
};
