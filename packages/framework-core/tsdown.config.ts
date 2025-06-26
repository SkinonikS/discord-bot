import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: [
    'index.ts',
    'src/bootstrappers/*.ts',
  ],
  outDir: 'dist',
  format: 'esm',
  dts: true,
  unbundle: true,
  skipNodeModulesBundle: true,
  silent: true,
});
