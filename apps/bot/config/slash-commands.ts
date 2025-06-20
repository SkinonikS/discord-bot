import { defineSlashCommandsConfig } from '@module/slash-commands';

export default defineSlashCommandsConfig({
  actions: [
    () => import('#/app/slash-commands/ping'),
  ],
});
