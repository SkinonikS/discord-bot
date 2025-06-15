import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: ['index.ts', 'src/module.ts', 'src/commands/*.ts'],
  outDir: 'dist',
  format: 'esm',
  dts: true,
  unbundle: true,
  skipNodeModulesBundle: true,
});
