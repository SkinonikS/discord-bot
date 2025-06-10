import type { Logger } from 'winston';
import type { LoggerInterface } from '#/types';

export default class WinstonLogger implements LoggerInterface {
  public constructor(
    protected readonly _logger: Logger,
  ) {
    //
  }

  info(message: string | object, ...args: unknown[]): void {
    this._log('info', message, ...args);
  }

  warn(message: string | object, ...args: unknown[]): void {
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
