import type { Application } from '@framework/core';
import { transports } from 'winston';
import type TransportStream from 'winston-transport';

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

export interface BaseTransportConfig<T extends string = string> {
  driver: T;
}

export interface TransformableInfo {
  level: string;
  message: unknown;
  label?: string;
  timestamp?: string;
  stack?: string;
}

export interface ConsoleTransportConfig extends BaseTransportConfig<'console'> {
  colorize?: boolean;
  printf?: (info: TransformableInfo) => string;
}

export interface DailyRotateFileTransportConfig extends BaseTransportConfig<'dailyRotateFile'> {
  maxSize?: string | number;
  maxFiles?: string | number;
  datePattern: string;
  zippedArchive: boolean;
  filename: string;
  auditFilename: string;
  directory: string;
}

export interface LokiTransportConfig extends BaseTransportConfig<'loki'> {
  host: string;
  labels: Record<string, string>;
}

export interface KnownTransports {
  console: ConsoleTransportConfig;
  loki: LokiTransportConfig;
  dailyRotateFile: DailyRotateFileTransportConfig;
}

export interface LoggerConfig {
  label: string;
  defaultMeta: Record<string, string>;
  level: 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'emergency';
  transports: TransportLoaderInterface;
}

export interface TransportLoaderOptions {
  app: Application;
  module: string;
}

export interface TransportLoaderInterface {
  load(options: TransportLoaderOptions): Promise<TransportStream[]>;
}
