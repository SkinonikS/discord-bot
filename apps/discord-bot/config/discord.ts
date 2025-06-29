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
  rateLimiter: {
    driver: new RedisRateLimiterDriver({ database: Env.DISCORD_RATE_LIMIT_REDIS_DATABASE }),
    points: 5,
    durationMs: 6000,
  },
  shardId: Env.DISCORD_SHARD_ID,
  shardCount: Env.DISCORD_SHARD_COUNT,
});
