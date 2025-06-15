import type { Application } from '@framework/core';
import { createLogger, format, config } from 'winston';
import type { TransportLoaderInterface, LoggerInterface, LoggerFactoryInterface, LoggerConfig } from '#/types';
import WinstonLogger from '#/winston-logger';

export default class WinstonLoggerFactory implements LoggerFactoryInterface {
  public constructor(
    protected readonly _app: Application,
    protected readonly _config: LoggerConfig,
    protected readonly _transportLoader: TransportLoaderInterface,
  ) { }

  public async createLogger(module: string): Promise<LoggerInterface> {
    const transports = await this._transportLoader.load({ app: this._app, module });

    const winstonLogger = createLogger({
      levels: config.syslog.levels,
      level: this._config.level,
      defaultMeta: this._config.defaultMeta,
      format: format.combine(
        format.label({ label: module }),
        format.errors({ stack: true }),
      ),
      transports,
    });

    return new WinstonLogger(winstonLogger);
  }
}
