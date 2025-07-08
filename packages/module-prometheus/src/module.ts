import type { Application, ConfigRepository, ModuleInterface } from '@framework/core/app';
import { importModule, ImportNotFoundException, instantiateIfNeeded } from '@framework/core/utils';
import type { LoggerInterface } from '@module/logger';
import { Registry } from 'prom-client';
import pkg from '#root/package.json';
import type { PrometheusConfig } from '#src/config/types';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'prometheus': Registry;
    'prometheus.logger': LoggerInterface;
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
    app.container.singleton('prometheus', () => {
      return new Registry();
    });

    app.container.singleton('prometheus.logger', async (container) => {
      const logger: LoggerInterface = await container.make('logger');
      return logger.copy(this.id);
    });
  }

  public async boot(app: Application): Promise<void> {
    const logger = await app.container.make('prometheus.logger');
    const registry = await app.container.make('prometheus');
    const config: ConfigRepository = await app.container.make('config');
    const prometheusConfig = config.get('prometheus');
    if (prometheusConfig.isErr()) {
      throw prometheusConfig.error;
    }

    for (const metricResolver of prometheusConfig.value.metrics) {
      try {
        const resolvedMetric = await importModule(() => metricResolver());
        const metric = await instantiateIfNeeded(resolvedMetric, app);

        registry.registerMetric(metric.metadata);
      } catch (e) {
        if (e instanceof ImportNotFoundException) {
          logger.error(e);
          return;
        }

        throw e;
      }
    }
  }
}
