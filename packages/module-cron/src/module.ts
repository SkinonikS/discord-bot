import type { Application, ConfigRepository, ModuleInterface } from '@framework/core/app';
import pkg from '#root/package.json';
import type { CronJobConfig } from '#src/config/types';
import Scheduler from '#src/scheduler';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'cron.scheduler': Scheduler;
  }

  interface ConfigBindings {
    'cron': CronJobConfig;
  }
}

export default class CronModule implements ModuleInterface {
  public readonly id: string = pkg.name;
  public readonly author: string = pkg.author;
  public readonly version: string = pkg.version;

  public register(app: Application): void {
    app.container.singleton('cron.scheduler', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const cronJobConfig = config.get('cron');

      const scheduler = new Scheduler(
        await container.make('app'),
        await container.make('logger'),
        await container.make('errorHandler'),
      );

      await scheduler.register(cronJobConfig.jobs);
      return scheduler;
    });
  }

  public async start(app: Application): Promise<void> {
    const scheduler = await app.container.make('cron.scheduler');
    scheduler.startCronJobs();
  }

  public async shutdown(app: Application): Promise<void> {
    const scheduler = await app.container.make('cron.scheduler');
    scheduler.stopCronJobs();
  }
}
