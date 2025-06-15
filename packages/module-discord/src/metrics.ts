import { Application } from '@framework/core';
import promClient from 'prom-client';

export const uptimeGauge = new promClient.Gauge({
  name: 'discord_uptime',
  help: 'Uptime of the Discord bot in seconds',
  labelNames: ['discord'],
  registers: [],
  async collect() {
    const discord = await Application.getInstance().container.make('discord.client');

    if (discord.isReady()) {
      this.set(discord.uptime / 1000);
    }
  },
});

export const pingGauge = new promClient.Gauge({
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

export const guildCountGauge = new promClient.Gauge({
  name: 'discord_guild_count',
  help: 'Number of guilds the Discord bot is in',
  labelNames: ['discord'],
  registers: [],
  async collect() {
    const discord = await Application.getInstance().container.make('discord.client');

    if (discord.isReady()) {
      this.set(discord.guilds.cache.size);
    }
  },
});

export const userCountGauge = new promClient.Gauge({
  name: 'discord_user_count',
  help: 'Number of users the Discord bot is used by',
  labelNames: ['discord'],
  registers: [],
  async collect() {
    const discord = await Application.getInstance().container.make('discord.client');

    if (discord.isReady()) {
      this.set(discord.users.cache.size);
    }
  },
});
