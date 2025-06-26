import { defineKernelConfig } from '@framework/core';

export default defineKernelConfig({
  configFiles: [
    () => import('#config/logger'),
    () => import('#config/discord'),
    () => import('#config/http-api'),
    () => import('#config/slash-commands'),
    () => import('#config/distube'),
    () => import('#config/prometheus'),
    () => import('#config/redis'),
  ],
  modules: [
    () => import('@module/discord/module'),
    () => import('@module/http-api/module'),
    () => import('@module/prometheus/module'),
    () => import('@module/distube/module'),
    () => import('@module/slash-commands/module'),
    () => import('@module/redis/module'),
  ],
});
