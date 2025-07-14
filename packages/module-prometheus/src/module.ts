import type { Application, ConfigRepository, ModuleInterface } from '@framework/core/app';
import { importModule, ImportNotFoundException, instantiateIfNeeded } from '@framework/core/utils';
import type { LoggerInterface } from '@module/logger';
import { Registry, Gauge, Summary, Histogram, Counter } from 'prom-client';
import pkg from '#root/package.json';
import type { PrometheusConfig } from '#src/config/types';
import { UnsupportedMetricTypeException } from '#src/exceptions';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'prometheus': Registry;
  }

  interface ConfigBindings {
    'prometheus': PrometheusConfig;
  }
}

export default class PrometheusModule implements ModuleInterface{
  public readonly id = pkg.name;
  public readonly author = pkg.author;
  public readonly version = pkg.version;

  public register(app: Application): void {
    app.container.singleton('prometheus', async (container) => {
      const logger: LoggerInterface = await container.make('logger');
      const config: ConfigRepository = await container.make('config');
      const prometheusConfig = config.get('prometheus');

      const registry = new Registry();
      for (const metricResolver of prometheusConfig.metrics) {
        try {
          const resolvedMetric = await importModule(() => metricResolver());
          const metric = await instantiateIfNeeded(resolvedMetric, app);

          const MetricClass = { Gauge, Counter, Histogram, Summary }[metric.type];
          if (! MetricClass) {
            throw new UnsupportedMetricTypeException(metric.type);
          }

          registry.registerMetric(new MetricClass({
            name: metric.name,
            help: metric.help,
            labelNames: metric.labels,
            registers: [],
            collect() {
              return metric.collect(this);
            },
          }));
        } catch (e) {
          if (e instanceof ImportNotFoundException) {
            logger.warn({ err: e }, `Failed to import metric: ${metricResolver.name}`);
            continue;
          }

          throw e;
        }
      }

      return registry;
    });
  }
}
