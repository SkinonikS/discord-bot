import fs from 'fs';
import path from 'path';
import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: ['bin/start-bot.ts'],
  outDir: 'dist/src',
  format: 'esm',
  unbundle: true,
  copy: [
    { from: '.env', to: 'dist/.env' }, // TODO: Replace
    { from: 'package.json', to: 'dist/package.json' },
    { from: 'logs', to: 'dist/logs' },
  ],
  clean: true,
  skipNodeModulesBundle: true,
});
