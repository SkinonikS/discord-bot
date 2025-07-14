import type { Logger } from 'pino';
import type { LoggerInterface } from '#src/types';

export default class PinoLogger implements LoggerInterface {
  public constructor(
    protected readonly _logger: Logger,
  ) {
    //
  }

  public info(message: string | Error, ...args: unknown[]): void;
  public info(object: unknown, message?: string, ...args: unknown[]): void;
  public info(message: string | object, ...args: unknown[]): void {
    this._log('info', message, ...args);
  }

  public warn(message: string | Error, ...args: unknown[]): void;
  public warn(object: unknown, message?: string, ...args: unknown[]): void;
  public warn(message: string | object, ...args: unknown[]): void {
    this._log('error', message, ...args);
  }

  public error(message: string | Error, ...args: unknown[]): void;
  public error(object: unknown, message?: string, ...args: unknown[]): void;
  public error(message: string | object, ...args: unknown[]): void {
    this._log('error', message, ...args);
  }

  public debug(message: string | Error, ...args: unknown[]): void;
  public debug(object: unknown, message?: string, ...args: unknown[]): void;
  public debug(message: string | object, ...args: unknown[]): void {
    this._log('debug', message, ...args);
  }

  public fatal(message: string | Error, ...args: unknown[]): void;
  public fatal(object: unknown, message?: string, ...args: unknown[]): void;
  public fatal(message: string | object, ...args: unknown[]): void {
    this._log('fatal', message, ...args);
  }

  public copy(label: string): LoggerInterface {
    return new PinoLogger(this._logger.child({ module: label }));
  }

  protected _log(level: keyof Logger, message: string | object, ...args: unknown[]): void {
    const logFn = this._logger[level] as (...args: unknown[]) => void;

    if (typeof logFn === 'function') {
      if (typeof message === 'object') {
        if (message instanceof Error) {
          logFn.call(this._logger, message, message.message, ...args);
        } else {
          logFn.call(this._logger, message, String(args[0]), ...args.slice(1));
        }
      } else {
        logFn.call(this._logger, String(message), ...args);
      }
    }
  }
}
