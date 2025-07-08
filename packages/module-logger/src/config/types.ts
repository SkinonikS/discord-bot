import type { Application } from '@framework/core/app';
import type { LoggerInterface } from '#src/types';

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'fatal';

export interface LoggerConfig {
  defaultTags: Record<string, string>;
  driver: LoggerDriverInterface;
}

export interface LoggerDriverOptions {
  defaultTags: Record<string, string>;
}

export interface LoggerDriverInterface {
  create(app: Application, options: LoggerDriverOptions): Promise<LoggerInterface> | LoggerInterface;
}
