import { createLogger, format, transports, config, Logger } from 'winston';
import { LoggerInterface, LoggerFactoryInterface } from '#core/application/types';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Application } from '#core/application/application';
import path from 'node:path';

export class WinstonLogger implements LoggerInterface {
  public constructor(
    protected readonly _logger: Logger,
  ) {
    //
  }

  info(message: string, ...args: unknown[]): void {
    this._log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this._log('warning', message, ...args);
  }

  error(message: string | object, ...args: unknown[]): void {
    this._log('error', message, ...args);
  }

  debug(message: string | object, ...args: unknown[]): void {
    this._log('debug', message, ...args);
  }

  notice(message: string | object, ...args: unknown[]): void {
    this._log('notice', message, ...args);
  }

  critical(message: string | object, ...args: unknown[]): void {
    this._log('crit', message, ...args);
  }

  emergency(message: string | object, ...args: unknown[]): void {
    this._log('emerg', message, ...args);
  }

  protected _log(level: string, message: string | object, ...args: unknown[]): void {
    if (typeof message === 'object') {
      this._logger.log(level, message);
    } else {
      this._logger.log(level, message, ...args);
    }
  }
}

export class WinstonLoggerFactory implements LoggerFactoryInterface {
  public constructor(
    protected readonly _app: Application,
    protected readonly _directory: string,
  ) {
    //
  }

  public createLogSource(source: string): LoggerInterface {
    const winstonLogger = createLogger({
      levels: config.syslog.levels,
      level: this._app.isDevelopment ? 'debug' : 'info',
      format: format.combine(
        format.errors({ stack: true }),
        format.timestamp({ format: 'HH:mm:ss' }),
      ),
      transports: [
        this._createConsoleTransport(source),
        this._createFileTransport(source),
      ],
    });

    return new WinstonLogger(winstonLogger);
  }

  protected _createFileTransport(source: string): DailyRotateFile {
    return new DailyRotateFile({
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      dirname: this._directory,
      filename: source,
      extension: '.log',
      auditFile: path.resolve(this._directory, 'audit.json'),
      format: this._formatLogEntry,
    });
  }

  protected _createConsoleTransport(source: string): transports.ConsoleTransportInstance {
    return new transports.Console({
      format: format.combine(
        format.colorize(),
        format.label({ label: source }),
        this._formatLogEntry,
      ),
    });
  }

  public _formatLogEntry = format.printf(({ level, message, label, timestamp, stack }) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-base-to-string
    return `${timestamp} ${label ? `[${label}] ` : ''}${level}: ${message}${stack ? `\n${stack}` : ''}`;
  });
}

export default { WinstonLogger, WinstonLoggerFactory } as const;
