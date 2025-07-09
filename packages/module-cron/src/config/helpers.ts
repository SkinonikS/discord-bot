import { defineBaseConfig } from '@framework/core/config';
import type { CronJobConfig } from '#src/config/types';

export const defineCronJobConfig = (config: Partial<CronJobConfig>) => defineBaseConfig<CronJobConfig>('cron', {
  jobs: config.jobs ?? [],
});
