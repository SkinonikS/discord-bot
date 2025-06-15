import { defineSlashCommandsConfig, LazyCommandLoader } from '@module/slash-commands';

export default defineSlashCommandsConfig({
  commands: new LazyCommandLoader([
    () => import('#/app/commands/ping'),
  ]),
});
