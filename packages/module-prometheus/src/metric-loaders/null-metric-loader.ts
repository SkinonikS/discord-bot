import type { Metric } from 'prom-client';
import type { MetricLoaderInterface } from '#/types';


export default class NullMetricLoader implements MetricLoaderInterface {
  public async load(): Promise<Metric[]> {
    return [];
  }
}
