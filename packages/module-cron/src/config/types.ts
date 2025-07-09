import type { BaseResolver } from '@framework/core/kernel';
import type { CronJobInterface } from '#src/types';

export type CronJobResolver = BaseResolver<new (...args: unknown[]) => CronJobInterface>;

export interface CronJobConfig {
  jobs: CronJobResolver[];
}
