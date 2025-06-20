import { ConfigNotFoundException, importModule, ImportNotFoundException, instantiateIfNeeded } from '@framework/core';
import type { Application, ConfigRepository, ModuleInterface } from '@framework/core';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { Registry } from 'prom-client';
import pkg from '../package.json';
import type { PrometheusConfig } from '#/types';

declare module '@framework/core' {
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
      const loggerFactory: LoggerFactoryInterface = await container.make('logger.factory');
      return loggerFactory.createLogger(this.id);
    });
  }

  public async boot(app: Application): Promise<void> {
    const logger = await app.container.make('prometheus.logger');
    const registry = await app.container.make('prometheus');
    const config: ConfigRepository = await app.container.make('config');
    const prometheusConfig = config.get('prometheus');

    if (! prometheusConfig) {
      throw new ConfigNotFoundException('prometheus');
    }

    for (const metricResolver of prometheusConfig.metrics) {
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
