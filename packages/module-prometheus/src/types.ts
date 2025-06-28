import type { Metric } from 'prom-client';

export interface MetricInterface {
  get metadata(): Metric;
}
