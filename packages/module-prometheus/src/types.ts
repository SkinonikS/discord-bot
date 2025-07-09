import type { Gauge, Counter, Histogram, Summary } from 'prom-client';

export type AvailableMetrics = {
  Gauge: Gauge;
  Counter: Counter;
  Histogram: Histogram;
  Summary: Summary;
};

export type MetricType = keyof AvailableMetrics;

export interface MetricInterface<T extends MetricType = MetricType> {
  readonly type: T;
  readonly name: string;
  readonly help: string;
  readonly labels: string[];
  collect(metric: AvailableMetrics[T]): void | Promise<void>;
}

export type GaugeMetricInterface = MetricInterface<'Gauge'>;
export type CounterMetricInterface = MetricInterface<'Counter'>;
export type HistogramMetricInterface = MetricInterface<'Histogram'>;
export type SummaryMetricInterface = MetricInterface<'Summary'>;
