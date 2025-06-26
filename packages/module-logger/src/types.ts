import type { Application } from '@framework/core';
import type { transport as Transport } from 'winston';

export interface LoggerInterface {
  info(message: string | object, ...args: unknown[]): void;
  warn(message: string | object, ...args: unknown[]): void;
  error(message: string | object, ...args: unknown[]): void;
  debug(message: string | object, ...args: unknown[]): void;
  notice(message: string | object, ...args: unknown[]): void;
  critical(message: string | object, ...args: unknown[]): void;
  emergency(message: string | object, ...args: unknown[]): void;
}

export interface LoggerFactoryInterface {
  createLogger(module: string): Promise<LoggerInterface>;
}

export interface TransportFactoryCreateOptions {
  module: string;
}

export interface TransportFactoryInterface {
  create(app: Application, options: TransportFactoryCreateOptions): Promise<Transport> | Transport;
}

export interface LoggerConfig {
  label: string;
  defaultMeta: Record<string, string>;
  showStackTraces: boolean;
  level: 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'emergency';
  transports: TransportFactoryInterface[];
}
