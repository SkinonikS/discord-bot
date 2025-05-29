import { defineConfig } from '#core/application/define-config';

export default defineConfig({
  configFiles: [
    () => import('#config/discord'),
  ],
  serviceProviders: [
    () => import('#modules/discord/service-provider'),
    () => import('#modules/slash-commands/service-provider'),
  ],
});
