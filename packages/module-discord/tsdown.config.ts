import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: [
    'index.ts',
    'src/connection/index.ts',
    'src/connection/rate-limiters/*.ts',
    'src/config/index.ts',
    'src/config/rate-limiter-drivers/*.ts',
    'src/module.ts',
    'src/vendors/*.ts',
  ],
  outDir: 'dist',
  format: 'esm',
  dts: true,
  unbundle: true,
  skipNodeModulesBundle: true,
  silent: true,
});
