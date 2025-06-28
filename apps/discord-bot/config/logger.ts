import { defineLoggerConfig } from '@module/logger/config';
import type { LoggerConfig } from '@module/logger/config';
import ConsoleTransportFactory from '#/app/logger/transports/console-transport-factory';
import { Env } from '#/bootstrap/env';
import pkg from '#/package.json';

export default defineLoggerConfig({
  label: pkg.name,
  level: Env.LOG_LEVEL as LoggerConfig['level'],
  showStackTraces: Env.LOG_SHOW_STACK_TRACES,
  transports: [
    new ConsoleTransportFactory(),
  ],
});
