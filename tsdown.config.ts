import { defineConfig } from 'tsdown/config';

export default defineConfig({
  workspace: true,
  external: (id: string) => {
    return id.startsWith('@app/') || id.startsWith('@module/') || id.startsWith('@framework/');
  },
});
