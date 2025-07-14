import type { Application } from '@framework/core/app';
import { defineSlashCommandsConfig, RedisRateLimiterDriver } from '@module/slash-commands/config';

export default defineSlashCommandsConfig({
  commands: [
    () => import('#app/slash-commands/ping'),
    () => import('#app/slash-commands/purge'),
  ],
  rateLimiter: {
    driver: new RedisRateLimiterDriver({ client: 'default' }),
    points: 1,
    durationMs: 5000,
    message: async (app: Application, expiredTimestamp: number, locale: string): Promise<string> => {
      const i18n = await app.container.make('i18n');
      return i18n.t('slashCommands.rateLimit', { lng: locale, timestamp: expiredTimestamp });
    },
  },
});
