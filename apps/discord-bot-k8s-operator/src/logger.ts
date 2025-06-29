import winston from 'winston';
import { Env } from '#/env';

export const createLogger = (): winston.Logger => {
  return winston.createLogger({
    level: Env.LOG_LEVEL,
    levels: winston.config.syslog.levels,
    format: winston.format.combine(
      winston.format.errors({ stack: Env.LOG_SHOW_STACK_TRACES }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf(({ level, message, timestamp, stack }) => {
            return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ''}`;
          }),
        ),
      }),
    ],
  });
};
