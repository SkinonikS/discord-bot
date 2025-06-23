import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  const discord = await event.context.container.make('discord.client');
  return {
    isReady: discord.isReady(),
    uptime: discord.uptime ?? 0,
  };
});
