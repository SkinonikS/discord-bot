import type { Application } from '@framework/core';
import { createLogger, format, config } from 'winston';
import type { LoggerInterface, LoggerFactoryInterface, LoggerConfig, TransportFactoryInterface } from '#/types';
import WinstonLogger from '#/winston-logger';

export default class WinstonLoggerFactory implements LoggerFactoryInterface {
  public constructor(
    protected readonly _app: Application,
    protected readonly _config: LoggerConfig,
    protected readonly _transports: TransportFactoryInterface[],
  ) { }

  public async createLogger(module: string): Promise<LoggerInterface> {
    const transports = this._transports.map(async (transportFactory) => {
      return transportFactory.create(this._app, { module });
    });

    const winstonLogger = createLogger({
      levels: config.syslog.levels,
      level: this._config.level,
      defaultMeta: this._config.defaultMeta,
      format: format.combine(
        format.errors({ stack: this._config.showStackTraces }),
      ),
      transports: await Promise.all(transports),
    });

    return new WinstonLogger(winstonLogger);
  }
}
