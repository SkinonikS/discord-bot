import path from 'path';
import type { Application } from '@framework/core/app';
import type { TransportTargetOptions } from 'pino';
import type { PinoLoggerDriverConfig } from '#src/config/logger-drivers/pino-logger-driver';
import type { TransportFactoryInterface } from '#src/pino/types';

export interface ConsoleTransportFactoryConfig {
  ignoreTags?: string[];
}

export default class ConsoleTransportFactory implements TransportFactoryInterface {
  public constructor(
    protected readonly _config: ConsoleTransportFactoryConfig,
  ) { }

  public create(_: Application, config: Omit<PinoLoggerDriverConfig, 'transports'>): TransportTargetOptions {
    return {
      target: path.resolve(import.meta.dirname, 'pino-pretty'),
      options: {
        ignoreTags: this._config.ignoreTags,
        showStackTraces: config.showStackTraces,
        colorize: true,
        translateTime: 'HH:MM:ss.l',
        singleLine: true,
      },
    };
  }
}
