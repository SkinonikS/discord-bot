import { bool, cleanEnv, str, num } from 'envalid';

export const Env = cleanEnv(process.env, {
  DISCORD_TOKEN: str(),
  DISTUBE_NSFW: bool({ default: false }),
  DISTUBE_FFMPEG_PATH: str({ default: undefined }),
  HTTP_API_PORT: num({ default: 8080 }),
  HTTP_API_HOST: str({ default: '127.0.0.1' }),
  LOKI_HOST: str({ default: 'http://localhost:3100' }),
  REDIS_URL: str({ default: 'redis://localhost:6379' }),
});
