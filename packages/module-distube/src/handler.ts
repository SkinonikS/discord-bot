import type { ErrorHandler } from '@framework/core/app';
import type { LoggerInterface } from '@module/logger';

export default class Handler {
  public constructor(
    protected readonly _errorHandler: ErrorHandler,
    protected readonly _logger: LoggerInterface,
  ) { }

  public debug(message: string): void {
    this._logger.debug(message);
  }

  public error(error: Error): void {
    this._errorHandler.handle(error);
  }
}
