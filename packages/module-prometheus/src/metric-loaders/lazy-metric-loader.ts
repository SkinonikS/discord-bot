import type { Application } from '@framework/core';
import { importDefault } from '@poppinss/utils';
import type { Metric } from 'prom-client';
import type { MetricLoaderInterface } from '#/types';

export type MetricLoader = (app: Application) => Promise<{ default: Metric }>;
export default class LazyMetricLoader implements MetricLoaderInterface {
  public constructor(protected readonly _transports: MetricLoader[]) { }

  public async load(app: Application): Promise<Metric[]> {
    const transports = this._transports.map(async (resolver) => {
      return importDefault(() => resolver(app));
    });

    return Promise.all(transports);
  }
}
