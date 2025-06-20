import { defineLoggerConfig } from '@module/logger';
import pkg from '../package.json';
import ConsoleTransportFactory from '#/app/logger/transports/console-transport-factory';
import LokiTransportFactory from '#/app/logger/transports/loki-transport-factory';
import { Env } from '#/bootstrap/env';

export default defineLoggerConfig({
  label: pkg.name,
  level: 'debug',
  showStackTraces: false,
  transports: [
    new ConsoleTransportFactory(),
    new LokiTransportFactory({
      host: Env.LOKI_HOST,
      label: pkg.name,
    }),
  ],
});
