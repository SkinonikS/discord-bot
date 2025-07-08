import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: [
    'index.ts',
    'src/config/index.ts',
    'src/module.ts',
    'src/vendors/*.ts',
    'src/config/logger-driver/index.ts',
    'src/config/logger-driver/*.ts',
    'src/pino/index.ts',
    'src/pino/transports/index.ts',
    'src/pino/transports/*.ts',
    'src/null-logger.ts',
  ],
  outDir: 'dist',
  format: 'esm',
  dts: true,
  unbundle: true,
  skipNodeModulesBundle: true,
  silent: true,
});
