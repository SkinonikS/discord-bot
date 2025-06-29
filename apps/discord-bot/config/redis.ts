import { defineRedisConfig } from '@module/redis/config';
import { Env } from '#bootstrap/env';

export default defineRedisConfig({
  default: 'default',
  clients: {
    default: {
      secure: Env.REDIS_SECURE,
      host: Env.REDIS_HOST,
      port: Env.REDIS_PORT,
      database: Env.REDIS_DATABASE,
      password: Env.REDIS_PASSWORD,
    },
  },
});
