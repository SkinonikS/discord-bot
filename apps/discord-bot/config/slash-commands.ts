import { defineSlashCommandsConfig, RedisRateLimiterDriver } from '@module/slash-commands/config';

export default defineSlashCommandsConfig({
  commands: [
    () => import('#app/slash-commands/ping'),
    () => import('#app/slash-commands/music'),
  ],
  rateLimiter: {
    driver: new RedisRateLimiterDriver({ client: 'default' }),
    points: 1,
    durationMs: 5000,
  },
});
