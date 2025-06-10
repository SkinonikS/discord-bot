import { defineKernelConfig, LazyModuleLoader, LazyConfigFileLoader } from '@package/framework';

export default defineKernelConfig({
  configFiles: new LazyConfigFileLoader([
    () => import('#config/discord'),
    () => import('#config/slash-commands'),
    () => import('#config/logger'),
  ]),
  modules: new LazyModuleLoader([
    () => import('@package/module-discord-client/module'),
    () => import('@package/module-http-api/module'),
    () => import('@package/module-slash-commands/module'),
    () => import('@package/module-music/module'),
  ]),
});
