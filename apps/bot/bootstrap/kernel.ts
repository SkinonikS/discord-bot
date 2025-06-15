import { defineKernelConfig, LazyModuleLoader, LazyConfigFileLoader } from '@framework/core';

export default defineKernelConfig({
  configFiles: new LazyConfigFileLoader([
    () => import('#config/discord'),
    () => import('#config/slash-commands'),
    () => import('#config/logger'),
    () => import('#config/distube'),
    () => import('#config/http-api'),
  ]),
  modules: new LazyModuleLoader([
    () => import('@module/discord/module'),
    () => import('@module/http-api/module'),
    () => import('@module/slash-commands/module'),
    () => import('@module/distube/module'),
    () => import('@module/music/module'),
    () => import('@module/prometheus/module'),
  ]),
});
