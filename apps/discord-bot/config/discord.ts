import { defineDiscordConfig, RedisRateLimiterDriver } from '@module/discord/config';
import { ActivityType, IntentsBitField } from '@module/discord/vendors/discordjs';
import { Env } from '#bootstrap/env';

export default defineDiscordConfig({
  token: Env.DISCORD_TOKEN,
  // TODO: make this configurable?
  intents: new IntentsBitField([
    'Guilds',
    'GuildMessages',
    'GuildVoiceStates',
    'DirectMessages',
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
    driver: new RedisRateLimiterDriver({ client: 'default' }),
    points: 5,
    durationMs: 6000,
  },
  shardId: Env.DISCORD_SHARD_ID,
  shardCount: Env.DISCORD_SHARD_COUNT,
});
