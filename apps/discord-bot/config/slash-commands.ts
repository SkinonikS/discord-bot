import { defineSlashCommandsConfig } from '@module/slash-commands/config';

export default defineSlashCommandsConfig({
  commands: [
    () => import('#/app/slash-commands/ping'),
  ],
});
