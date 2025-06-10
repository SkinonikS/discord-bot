import { defineLoggerConfig } from '@package/module-logger';

export default defineLoggerConfig({
  name: 'discord-bot',
  level: (app) => app.isEnvironment('development') ? 'debug' : 'info',
});
