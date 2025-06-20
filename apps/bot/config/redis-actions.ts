import { defineRedisActionsConfig } from '@module/redis-actions';

export default defineRedisActionsConfig({
  url: process.env.REDIS_URL,
  database: 0,
  actions: [
    () => import('#/app/redis-actions/ping-user'),
  ],
});
