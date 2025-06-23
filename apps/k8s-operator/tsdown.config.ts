import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: ['index.ts'],
  outDir: 'dist',
  format: 'esm',
  sourcemap: true,
  unbundle: true,
  skipNodeModulesBundle: true,
});
