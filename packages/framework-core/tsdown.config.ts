import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: [
    'index.ts',
    'src/app/index.ts',
    'src/kernel/index.ts',
    'src/config/index.ts',
    'src/utils/index.ts',
    'src/kernel/bootstrappers/index.ts',
    'src/kernel/bootstrappers/*.ts',
    'src/vendors/*.ts',
  ],
  outDir: 'dist',
  format: 'esm',
  dts: true,
  unbundle: true,
  skipNodeModulesBundle: true,
  silent: true,
});
