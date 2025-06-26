import { defineRedisConfig } from '@module/redis';
import { Env } from '#/bootstrap/env';

export default defineRedisConfig({
  secure: Env.REDIS_SECURE,
  host: Env.REDIS_HOST,
  port: Env.REDIS_PORT,
  database: Env.REDIS_DATABASE,
  password: Env.REDIS_PASSWORD,
});
