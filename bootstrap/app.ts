import { defineConfig } from '#core/application/define-config';

export default defineConfig({
  configFiles: [
    () => import('#config/discord'),
    () => import('#config/slash-commands'),
  ],
  serviceProviders: [
    () => import('#modules/discord/service-provider'),
    () => import('#modules/slash-commands/service-provider'),
  ],
});
