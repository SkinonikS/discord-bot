import { bool, cleanEnv, str, num } from 'envalid';

export const Env = cleanEnv(process.env, {
  APP_UID: str({ default: undefined }),

  DISCORD_TOKEN: str(),
  DISCORD_SHARD_ID: num({ default: 0 }),
  DISCORD_SHARD_COUNT: num({ default: 1 }),
  DISCORD_RATE_LIMIT_REDIS_DATABASE: num({ default: 0 }),

  DISTUBE_NSFW: bool({ default: false }),
  DISTUBE_FFMPEG_PATH: str({ default: undefined }),

  HTTP_API_PORT: num({ default: 3001 }),
  HTTP_API_HOST: str({ default: '0.0.0.0' }),

  REDIS_SECURE: bool({ default: false }),
  REDIS_HOST: str({ default: 'localhost' }),
  REDIS_PORT: num({ default: 6379 }),
  REDIS_DATABASE: num({ default: 0 }),
  REDIS_PASSWORD: str({ default: undefined }),

  REDIS_EVENTS_CHANNEL_NAME: str({ default: 'discord-bot-events' }),
  REDIS_EVENTS_DATABASE: num({ default: 0 }),

  LOG_LEVEL: str({ default: 'debug' }),
  LOG_SHOW_STACK_TRACES: bool({ default: false }),
  LOG_LOKI_URL: str({ default: 'http://localhost:3100' }),
});
