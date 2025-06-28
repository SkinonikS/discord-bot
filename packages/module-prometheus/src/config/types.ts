import type { BaseResolver } from '@framework/core/kernel';
import type { MetricInterface } from '#src/types';

export type MetricResolver = BaseResolver<MetricInterface | (new (...args: unknown[]) => MetricInterface)>;

export interface PrometheusConfig {
  metrics: MetricResolver[];
}
