import { defineSlashCommandsConfig, RedisRateLimiterDriver } from '@module/slash-commands/config';

export default defineSlashCommandsConfig({
  commands: [
    () => import('#/app/slash-commands/ping'),
  ],
  rateLimiter: {
    driver: new RedisRateLimiterDriver({ database: 0 }),
    points: 1,
    durationMs: 5000,
  },
});
