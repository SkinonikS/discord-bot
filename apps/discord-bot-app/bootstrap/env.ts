import { Application } from '@package/framework';
import { cleanEnv, str } from 'envalid';

export const Env = cleanEnv(process.env, {
  DISCORD_TOKEN: str(),
}, {
  reporter: async ({ errors }) => {
    if (Object.keys(errors).length === 0) {
      return;
    }

    const app = Application.getInstance();
    if (app.container.hasBinding('logger')) {
      const logger = await app.container.make('logger');
      const messages = Object.entries(errors).map(([k, e]) => `${k}: ${e.message}`).join(', ');
      logger.critical(`Environment validation errors: ${messages}`);
    } else {
      console.error(errors);
    }

    process.exit(1);
  },
});
