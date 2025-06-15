import { defineLoggerConfig, LazyTransportLoader } from '@module/logger';
import { transports, format } from 'winston';
import WinstionLoki from 'winston-loki';
import pkg from '../package.json';
import { Env } from '#/bootstrap/env';

export default defineLoggerConfig({
  label: pkg.name,
  level: 'info',
  transports: new LazyTransportLoader([
    () => new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({ format: 'HH:mm:ss' }),
        format.printf(({ label, level, message, timestamp, stack }) => {
          return `${timestamp} [${label}] ${level}: ${message}${stack ? `\n${stack}` : ''}`;
        }),
      ),
    }),
    ({ module }) => new WinstionLoki({
      host: Env.LOKI_HOST,
      labels: { app: pkg.name, module },
      format: format.json(),
      json: true,
      replaceTimestamp: true,
    }),
  ]),
});
