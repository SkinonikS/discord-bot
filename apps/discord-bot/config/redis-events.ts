import { defineRedisEventsConfig } from '@module/redis-events';
import { Env } from '#/bootstrap/env';

export default defineRedisEventsConfig({
  channelName: Env.REDIS_EVENTS_CHANNEL_NAME,
  database: Env.REDIS_EVENTS_DATABASE,
  eventHandlers: [
    () => import('#/app/redis-actions/ping-user'),
  ],
});
