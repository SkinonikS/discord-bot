import { defineConfig } from '#modules/slash-commands/define-config';

export default defineConfig({
  commands: [
    () => import('#modules/slash-commands/commands/ping'),
  ],
});
