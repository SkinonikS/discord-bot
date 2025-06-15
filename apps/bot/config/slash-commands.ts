import { defineSlashCommandsConfig, LazyCommandsLoader } from '@module/slash-commands';

export default defineSlashCommandsConfig({
  commands: new LazyCommandsLoader([
    () => import('@module/slash-commands/commands/ping'),
  ]),
});
