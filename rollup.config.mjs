import rollupTypescript from '@rollup/plugin-typescript';
import rollupNodeExternal from 'rollup-plugin-node-externals';
import rollupDelete from 'rollup-plugin-delete'
import rollupCopy from 'rollup-plugin-copy';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'bin/start-bot.ts',
  output: {
    dir: 'build',
    format: 'es',
    preserveModules: true,
  },
  plugins: [
    rollupTypescript(),
    rollupNodeExternal(),
    rollupDelete({ targets: 'build', runOnce: true }),
    rollupCopy({
      targets: [
        { src: 'logs', dest: 'build' },
        { src: '.env', dest: 'build' },
      ]
    })
  ],
});
