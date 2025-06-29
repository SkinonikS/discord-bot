import { Application } from '@framework/core/app';
import type Manager from '#src/manager';

export const getSlashCommandManager = (app?: Application): Promise<Manager> => {
  app = app ?? Application.getInstance();
  return app.container.make('slash-commands');
};
