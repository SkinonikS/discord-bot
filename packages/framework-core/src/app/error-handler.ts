import type { LoggerInterface } from '@module/logger';
import { Exception } from '@poppinss/exception';
import type Application from '#src/app/application';
import { FatalErrorException } from '#src/app/exceptions';

export default class ErrorHandler {
  protected readonly _fatalErrorCodes: Set<string> = new Set([
    'ECONNREFUSED',
    'ERRCONNECT',
    'EADDRINUSE',
    'EACCES',
    'ENOTFOUND',
  ]);

  public constructor(
    protected readonly _app: Application,
  ) { }

  public isFatalError(error: string | Error): boolean {
    if (error instanceof FatalErrorException) {
      return true;
    }

    if (typeof error === 'string') {
      return this._fatalErrorCodes.has(error);
    }

    const code = 'code' in error ? String(error.code) : error.name.endsWith('Exception') ? error.name.slice(0, -9) : error.name;
    return this._fatalErrorCodes.has(code);
  }

  public addFatalErrorCode(error: string | string[]): this {
    if (! Array.isArray(error)) {
      error = [error];
    }

    for (const err of error) {
      this._fatalErrorCodes.add(err);
    }

    return this;
  }

  public async handle(error: unknown): Promise<void> {
    const e = this._normalizeError(error);
    const logger = await this._resolveLogger();

    if (this.isFatalError(e)) {
      logger.fatal(e);

      try {
        await this._app.shutdown();
      } catch (e) {
        logger.fatal({ err: e }, 'Failed to shutdown the application. This could lead to data loss');
      }

      process.exit(1);
    }

    logger.error(e);
  }

  protected _normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Exception('Unknown error', {
      cause: error,
      status: 500,
      code: 'UnknownError',
    });
  }

  protected async _resolveLogger(): Promise<LoggerInterface> {
    return this._app.container.make('logger').catch(() => {
      const fallbackLogger = {
        error: console.error,
        fatal: console.error,
        info: console.info,
        debug: console.debug,
        warn: console.warn,
        copy: () => fallbackLogger,
      };
      return fallbackLogger;
    });
  }
}
