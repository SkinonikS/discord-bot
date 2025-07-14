import { defineLoggerConfig, PinoLoggerDriver } from '@module/logger/config';
import type { LogLevel } from '@module/logger/config';
import { ConsoleTransportFactory } from '@module/logger/pino';
import { Env } from '#root/bootstrap/env';
import pkg from '#root/package.json';

export default defineLoggerConfig({
  defaultTags: {
    app: pkg.name,
    version: pkg.version,
    shardId: String(Env.DISCORD_SHARD_ID),
  },
  driver: new PinoLoggerDriver({
    level: Env.LOG_LEVEL as LogLevel,
    showStackTraces: Env.LOG_SHOW_STACK_TRACES,
    transports: [
      new ConsoleTransportFactory({
        ignoreTags: ['pid', 'hostname', 'app', 'version'],
      }),
    ],
  }),
});
