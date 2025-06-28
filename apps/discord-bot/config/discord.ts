import { defineDiscordConfig, RedisRateLimiterDriver } from '@module/discord/config';
import { ActivityType } from 'discord.js';
import { IntentsBitField } from 'discord.js';
import { Env } from '#bootstrap/env';

export default defineDiscordConfig({
  token: Env.DISCORD_TOKEN,
  intents: new IntentsBitField([
    'Guilds',
    'GuildMessages',
    'GuildVoiceStates',
    'DirectMessages',
    'MessageContent',
  ]),
  richPresence: {
    afk: false,
    status: 'online',
    activities: [{
      name: 'with the code',
      type: ActivityType.Streaming,
      state: 'Development',
      url: 'https://github.com/SkinonikS/discord-bot',
    }],
  },
  rateLimiter: new RedisRateLimiterDriver({
    maxConcurrency: Env.DISCORD_RATE_LIMIT_MAX_CONCURRENCY,
    timeout: Env.DISCORD_RATE_LIMIT_TIMEOUT,
    channel: Env.DISCORD_RATE_LIMIT_CHANNEL,
    database: Env.REDIS_DATABASE,
  }),
  shardId: Env.DISCORD_SHARD_ID,
  shardCount: Env.DISCORD_SHARD_COUNT,
});
