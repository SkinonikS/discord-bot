import type { Client } from 'discord.js';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async ({ context }) => {
  const discord: Client = await context.container.make('discord.client');

  return {
    isReady: discord.isReady(),
    uptime: ((discord.uptime ?? 0) / 1000),
  };
});
