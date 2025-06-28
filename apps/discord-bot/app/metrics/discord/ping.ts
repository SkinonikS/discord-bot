import type { MetricInterface } from '@module/prometheus';
import type { Client } from 'discord.js';
import { Gauge } from 'prom-client';
import type { Metric } from 'prom-client';

export default class PingMetric implements MetricInterface {
  static containerInjections = {
    _constructor: {
      dependencies: ['discord.client'],
    },
  };

  public constructor(protected readonly _discord: Client) { }

  public get metadata(): Metric {
    const self = this;
    return new Gauge({
      name: 'discord_ping',
      help: 'Ping of the Discord bot in milliseconds',
      labelNames: ['discord'],
      registers: [],
      collect() {
        self.collect(this);
      },
    });
  }

  protected async collect(gauge: Gauge): Promise<void> {
    const ping = this._discord.ws.ping ?? 0;
    gauge.set(ping);
  }
}
