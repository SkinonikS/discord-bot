import { Application } from '@framework/core/app';
import type Scheduler from '#src/scheduler';

export const getScheduler = (app?: Application): Promise<Scheduler> => {
  app ??= Application.getInstance();
  return app.container.make('cron.scheduler');
};
