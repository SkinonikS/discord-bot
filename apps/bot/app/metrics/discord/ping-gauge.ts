import { Application } from '@framework/core';
import { Gauge } from 'prom-client';

export default new Gauge({
  name: 'discord_ping',
  help: 'Ping of the Discord bot in milliseconds',
  labelNames: ['discord'],
  registers: [],
  async collect() {
    const discord = await Application.getInstance().container.make('discord.client');

    if (discord.isReady()) {
      this.set(discord.ws.ping);
    }
  },
});
