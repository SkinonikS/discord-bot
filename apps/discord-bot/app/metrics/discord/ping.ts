import type { Client } from '@module/discord/vendors/discordjs';
import type { GaugeMetricInterface } from '@module/prometheus';
import type { Gauge } from '@module/prometheus/vendors/prom-client';

export default class PingMetric implements GaugeMetricInterface  {
  public static containerInjections = {
    _constructor: {
      dependencies: ['discord.client'],
    },
  };

  public constructor(
    protected readonly _discord: Client,
  ) { }

  public readonly type = 'Gauge';
  public readonly name = 'discord_ping';
  public readonly help = 'Ping of the Discord bot in milliseconds';
  public readonly labels = ['discord'];

  public async collect(metric: Gauge): Promise<void> {
    const ping = this._discord.ws.ping ?? 0;
    metric.set(ping);
  }
}
