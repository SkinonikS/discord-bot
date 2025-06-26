import { defineConfig } from 'tsdown/config';

export default defineConfig({
  silent: true,
  workspace: true,
  external: (id: string) => {
    return id.startsWith('@app/') || id.startsWith('@module/') || id.startsWith('@framework/');
  },
});
