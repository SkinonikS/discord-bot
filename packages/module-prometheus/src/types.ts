import type { Application } from '@framework/core';
import type { Metric } from 'prom-client';

export interface PrometheusConfig {
  metrics: MetricLoaderInterface;
}

export interface MetricLoaderInterface {
  load(app: Application): Promise<Metric[]>;
}
