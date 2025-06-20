import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: [
    'bin/start-bot.ts',
  ],
  outDir: 'dist/src',
  copy: [
    // { from: '.env', to: 'dist/.env' }, // TODO: Replace
    // { from: 'logs', to: 'dist/logs' },
  ],
  sourcemap: true,
  unbundle: true,
  skipNodeModulesBundle: true,
});
