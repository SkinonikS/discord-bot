import path from 'node:path';
import type { Application } from '@package/framework';
import { createLogger, format, transports, config } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import type { LoggerInterface, LoggerFactoryInterface, LoggerOptions } from '#/types';
import WinstonLogger from '#/winston-logger';

export default class WinstonLoggerFactory implements LoggerFactoryInterface {
  public constructor(
    protected readonly _app: Application,
    protected readonly _directory: string,
  ) {
    //
  }

  public createLogger(options: LoggerOptions): LoggerInterface {
    const winstonLogger = createLogger({
      levels: config.syslog.levels,
      level: options.level,
      format: format.combine(
        format.errors({ stack: true }),
        format.timestamp({ format: 'HH:mm:ss' }),
        format.printf(({ level, message, label, timestamp, stack }) => {
          return `${timestamp} ${label ? `[${label}] ` : ''}${level}: ${message}${stack ? `\n${stack}` : ''}`;
        }),
      ),
      transports: [
        this._createConsoleTransport(options.name),
        this._createFileTransport(options.name),
      ],
    });

    return new WinstonLogger(winstonLogger);
  }

  protected _createFileTransport(name: string): DailyRotateFile {
    return new DailyRotateFile({
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      filename: '%DATE%',
      dirname: path.resolve(this._directory, name),
      extension: '.log',
      auditFile: path.resolve(this._directory, 'audit.json'),
    });
  }

  protected _createConsoleTransport(name: string): transports.ConsoleTransportInstance {
    return new transports.Console({
      format: format.combine(
        format.colorize(),
        format.label({ label: name }),
        format.printf(({ level, message, label, timestamp, stack }) => {
          return `${timestamp} ${label ? `[${label}] ` : ''}${level}: ${message}${stack ? `\n${stack}` : ''}`;
        }),
      ),
    });
  }
}
