import { defineSlashCommandsConfig } from '@package/module-slash-commands';
import { LazyCommandsLoader } from '@package/module-slash-commands';

export default defineSlashCommandsConfig({
  commands: new LazyCommandsLoader([
    () => import('@package/module-slash-commands/commands/ping'),
  ]),
});
