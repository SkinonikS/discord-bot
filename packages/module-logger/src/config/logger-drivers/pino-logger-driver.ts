import type { Application } from '@framework/core/app';
import pino from 'pino';
import type { LoggerDriverInterface, LoggerDriverOptions, LogLevel } from '#src/config/types';
import PinoLogger from '#src/pino/pino-logger';
import type { TransportFactoryInterface } from '#src/pino/types';
import type { LoggerInterface } from '#src/types';

export interface PinoLoggerDriverConfig {
  level: LogLevel;
  stackTraces: boolean;
  transports: TransportFactoryInterface[];
}

export default class PinoLoggerDriver implements LoggerDriverInterface {
  public constructor(
    protected readonly _config: PinoLoggerDriverConfig,
  ) { }

  public async create(app: Application, options: LoggerDriverOptions): Promise<LoggerInterface> {
    const targets = this._config.transports.map((transport) => transport.create(app, {
      level: this._config.level,
      stackTraces: this._config.stackTraces,
    }));

    const pinoLogger = pino({
      mixin: () => ({ ...options.defaultTags }),
      level: this._config.level,
      transport: {
        targets,
      },
    });

    return new PinoLogger(pinoLogger);
  }
}
