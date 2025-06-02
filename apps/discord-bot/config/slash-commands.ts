import { defineSlashCommandsConfig } from '@package/module-slash-commands';

export default defineSlashCommandsConfig({
  commands: [
    () => import('@package/module-slash-commands/commands/ping'),
  ],
});
