import type { BaseResolver } from '@framework/core';
import type { Metric } from 'prom-client';

export type MetricResolver = BaseResolver<new () => MetricInterface>;

export interface MetricInterface {
  get metadata(): Metric;
}

export interface PrometheusConfig {
  metrics: MetricResolver[];
}
