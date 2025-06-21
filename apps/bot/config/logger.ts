import { defineLoggerConfig } from '@module/logger';
import type { LoggerConfig } from '@module/logger';
import ConsoleTransportFactory from '#/app/logger/transports/console-transport-factory';
import LokiTransportFactory from '#/app/logger/transports/loki-transport-factory';
import { Env } from '#/bootstrap/env';
import pkg from '#/package.json';

export default defineLoggerConfig({
  label: pkg.name,
  level: Env.LOG_LEVEL as LoggerConfig['level'],
  showStackTraces: Env.LOG_SHOW_STACK_TRACES,
  transports: [
    new ConsoleTransportFactory(),
    new LokiTransportFactory({
      host: Env.LOKI_HOST,
      label: pkg.name,
    }),
  ],
});
