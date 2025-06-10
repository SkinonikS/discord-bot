import type { Application } from '@package/framework';

export interface LoggerInterface {
  info(message: string | object, ...args: unknown[]): void;
  warn(message: string | object, ...args: unknown[]): void;
  error(message: string | object, ...args: unknown[]): void;
  debug(message: string | object, ...args: unknown[]): void;
  notice(message: string | object, ...args: unknown[]): void;
  critical(message: string | object, ...args: unknown[]): void;
  emergency(message: string | object, ...args: unknown[]): void;
}

export interface LoggerOptions {
  name: string;
  level: string;
}

export interface LoggerFactoryInterface {
  createLogger(options: LoggerOptions): LoggerInterface;
}

export interface LoggerConfig extends Record<string, unknown> {
  name: string;
  level: ((app: Application) => string) | string;
}
