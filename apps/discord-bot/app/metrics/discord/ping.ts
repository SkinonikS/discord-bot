import type { Client } from '@module/discord/vendors/discordjs';
import type { MetricInterface } from '@module/prometheus';
import type { Metric } from '@module/prometheus/vendors/prometheus';
import { Gauge } from '@module/prometheus/vendors/prometheus';

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
