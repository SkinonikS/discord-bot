import { defineKernelConfig } from '@package/framework';

export default defineKernelConfig({
  configFiles: [
    () => import('#config/discord'),
    () => import('#config/slash-commands'),
  ],
  serviceProviders: [
    () => import('@package/module-discord-client/service-provider'),
    () => import('@package/module-http-api/service-provider'),
    () => import('@package/module-slash-commands/service-provider'),
  ],
});
