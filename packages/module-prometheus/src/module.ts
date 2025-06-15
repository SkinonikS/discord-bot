import os from 'node:os';
import type { Application, ModuleInterface } from '@framework/core';
import { Registry, Gauge, Histogram } from 'prom-client';
import { name, author, version } from '../package.json';

declare module '@framework/core' {
  interface ContainerBindings {
    prometheus: Registry;
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
    const prometheus = await this._app.container.make('prometheus');

    prometheus.registerMetric(new Histogram({
      name: 'cpu_avgerage_load',
      help: 'CPU usage in seconds for user',
      registers: [],
      async collect() {
        os.totalmem();
      },
    }));
  }
}
