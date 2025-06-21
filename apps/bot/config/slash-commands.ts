import { defineSlashCommandsConfig } from '@module/slash-commands';

export default defineSlashCommandsConfig({
  commands: [
    () => import('#/app/slash-commands/ping'),
  ],
});
