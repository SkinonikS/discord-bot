import type { Application, ErrorHandler } from '@framework/core/app';
import { importModule, ImportNotFoundException, instantiateIfNeeded } from '@framework/core/utils';
import type { LoggerInterface } from '@module/logger';
import { CronJob } from 'cron';
import type { CronJobResolver } from '#src/config/types';

export default class Scheduler {
  protected _cronJobs: Map<string, CronJob<never, null>> = new Map();

  public constructor(
    protected readonly _app: Application,
    protected readonly _logger: LoggerInterface,
    protected readonly _errorHandler: ErrorHandler,
  ) { }

  public async register(cronJobs: CronJobResolver[]): Promise<void> {
    for (const cronJobsResolver of cronJobs) {
      try {
        const resolvedCronJob = await importModule(() => cronJobsResolver());
        const cronJob = await instantiateIfNeeded(resolvedCronJob, this._app);

        if (this._cronJobs.has(cronJob.name)) {
          this._logger.warn(`Cron job with name "${cronJob.name}" already exists`);
          continue;
        }

        const baseCronJob = CronJob.from({
          name: cronJob.name,
          cronTime: cronJob.cronTime,
          onTick: async () => {
            this._logger.debug(`Executing cron job: ${cronJob.name}`);
            await cronJob.onTick();
          },
          onComplete: async () => {
            this._logger.debug(`Cron job completed: ${cronJob.name}`);
            if (cronJob.onExit) {
              await cronJob.onExit();
            }
          },
          runOnInit: false,
          start: false,
          errorHandler: async (e: Error) => {
            this._errorHandler.handle(e);
          },
        });

        this._cronJobs.set(cronJob.name, baseCronJob);
        this._logger.debug(`Registered cronjob: ${cronJob.name}`);
      } catch (e) {
        if (e instanceof ImportNotFoundException) {
          this._logger.warn({ err: e }, `Failed to import cron job: ${cronJobsResolver.name}`);
          continue;
        }

        throw e;
      }
    }
  }

  public startCronJobs(): void {
    for (const cronJob of this._cronJobs.values()) {
      if (cronJob.isActive) {
        continue;
      }

      this._logger.debug(`Scheduling cron job: ${cronJob.name}`);
      cronJob.start();
    }

    this._logger.info(`Scheduled ${this._cronJobs.size} cron jobs`);
  }

  public stopCronJobs(): void {
    for (const cronJobs of this._cronJobs.values()) {
      if (cronJobs.isActive) {
        cronJobs.stop();
        this._logger.debug(`Stopped cron job: ${cronJobs.name}`);
      }
    }

    this._logger.info('Stopped all cron jobs');
  }
}
