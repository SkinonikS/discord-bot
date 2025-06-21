import { defineRedisActionsConfig } from '@module/redis-actions';
import { Env } from '#/bootstrap/env';

export default defineRedisActionsConfig({
  url: Env.REDIS_URL,
  database: Env.REDIS_DATABASE,
  actions: [
    () => import('#/app/redis-actions/ping-user'),
  ],
});
