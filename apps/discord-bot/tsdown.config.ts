import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: [
    'bin/start-bot.ts',
  ],
  outDir: 'dist',
  sourcemap: true,
  unbundle: true,
  skipNodeModulesBundle: true,
  silent: true,
});
