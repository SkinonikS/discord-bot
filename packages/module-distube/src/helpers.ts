import { Application } from '@framework/core/app';
import type DisTube from 'distube';

export const getDistube = (app?: Application): Promise<DisTube> => {
  app = app ?? Application.getInstance();
  return app.container.make('distube');
};
