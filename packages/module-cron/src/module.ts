import type { Application, ConfigRepository, ErrorHandler, ModuleInterface } from '@framework/core/app';
import type { LoggerInterface } from '../../module-logger/dist/src/types';
import type { CronJobConfig } from './config/types';
import pkg from '#root/package.json';
import Scheduler from '#src/scheduler';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'cron.scheduler': Scheduler;
    'cron.logger': LoggerInterface;
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
      if (cronJobConfig.isErr()) {
        throw cronJobConfig.error;
      }

      const app = await container.make('app');
      const errorHandler: ErrorHandler = await container.make('errorHandler');
      const logger = await container.make('cron.logger');
      const scheduler = new Scheduler(app, errorHandler, logger);

      await scheduler.register(cronJobConfig.value.jobs);
      return scheduler;
    });

    app.container.singleton('cron.logger', async (container) => {
      const logger: LoggerInterface = await container.make('logger');
      return logger.copy(this.id);
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
