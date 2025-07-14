# Prometheus Module
A Prometheus metrics collection module which provides metric registration, collection, and monitoring capabilities.
Useful when you are using some kind of monitoring system like Prometheus, Grafana, etc.

## Creating Metrics
To create custom metrics, you can implement the `MetricInterface`. In total, there are four types of metrics available:
- **Counter** (CounterMetricInterface): A cumulative metric that represents a single monotonically increasing counter whose value can only increase or reset to zero on restart.
- **Gauge** (GaugeMetricInterface): A metric that represents a single numerical value that can arbitrarily go up and down.
- **Histogram** (HistogramMetricInterface): A metric that samples observations (e.g., request durations or response sizes) and counts them in configurable buckets.
- **Summary** (SummaryMetricInterface): A metric that samples observations and provides a total count, sum, and configurable quantiles
Here's an example of a custom metric:

```ts
import { Counter } from '@module/prometheus/vendors/prom-client';
import type { CounterMetricInterface } from '@module/prometheus';

export default class CommandExecutionsMetric implements CounterMetricInterface {
  public readonly type = 'Counter' as const;
  public readonly name = 'discord_commands_executed_total';
  public readonly help = 'Total number of commands executed';
  public readonly labels = ['command', 'status'];

  public collect(metric: Counter): void {
    metric.inc(1);
  }
}
```

# API Reference

```ts
interface MetricInterface<T extends MetricType = MetricType> {
  readonly type: T;
  readonly name: string;
  readonly help: string;
  readonly labels: string[];
  collect(metric: AvailableMetrics[T]): void | Promise<void>;
}

type CounterMetricInterface = MetricInterface<'Counter'>;
type GaugeMetricInterface = MetricInterface<'Gauge'>;
type HistogramMetricInterface = MetricInterface<'Histogram'>;
type SummaryMetricInterface = MetricInterface<'Summary'>;

interface PrometheusConfig {
  metrics: MetricResolver[];
}

type MetricResolver = BaseResolver<MetricInterface | (new (...args: unknown[]) => MetricInterface)>;
```

## Container Bindings
```ts
declare module '@framework/core/app' {
  interface ContainerBindings {
    'prometheus': Registry;
  }

  interface ConfigBindings {
    'prometheus': PrometheusConfig;
  }
}
```
