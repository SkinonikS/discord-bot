import { defineKernelConfig } from '@framework/core/config';

export default defineKernelConfig({
  configFiles: [
    () => import('#config/logger'),
    () => import('#config/discord'),
    () => import('#config/redis'),
    () => import('#config/http-api'),
    () => import('#config/slash-commands'),
    () => import('#config/distube'),
    () => import('#config/prometheus'),
    () => import('#config/i18n'),
  ],
  modules: [
    () => import('@module/redis/module'),
    () => import('@module/discord/module'),
    () => import('@module/http-api/module'),
    () => import('@module/prometheus/module'),
    () => import('@module/distube/module'),
    () => import('@module/slash-commands/module'),
    () => import('@module/i18n/module'),
  ],
});
