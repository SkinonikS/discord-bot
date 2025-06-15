import { ConfigNotFoundException, type Application, type ConfigRepository, type ModuleInterface } from '@framework/core';
import { Registry } from 'prom-client';
import { name, author, version } from '../package.json';
import type { PrometheusConfig } from './types';

declare module '@framework/core' {
  interface ContainerBindings {
    prometheus: Registry;
  }

  interface ConfigBindings {
    prometheus: PrometheusConfig;
  }
}

export default class PrometheusModule implements ModuleInterface{
  public readonly id = name;
  public readonly author = author;
  public readonly version = version;

  public constructor(protected _app: Application) { }

  public register(): void {
    this._app.container.singleton(Registry, () => {
      return new Registry();
    });

    this._app.container.alias('prometheus', Registry);
  }

  public async boot(): Promise<void> {
    const registry = await this._app.container.make('prometheus');
    const config: ConfigRepository = await this._app.container.make('config');
    const prometheusConfig = config.get('prometheus');

    if (! prometheusConfig) {
      throw new ConfigNotFoundException([this.id]);
    }

    const metrics = await prometheusConfig.metrics.load(this._app);
    for (const metric of metrics) {
      registry.registerMetric(metric);
    }
  }
}
