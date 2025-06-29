import type { LoggerInterface } from '@module/logger';
import { Exception } from '@poppinss/exception';
import debug from '#root/debug';
import type Application from '#src/app/application';
import { ConfigNotFoundException, FatalErrorException, InvalidStateTransitionException } from '#src/app/exceptions';
import type { ReportableException, ReportCallback } from '#src/app/types';

export default class ErrorHandler {
  protected readonly _reporters: Map<string, Set<ReportCallback>> = new Map();

  protected readonly _fatalErrors: Set<string> = new Set([
    ConfigNotFoundException.code,
    InvalidStateTransitionException.code,
    'ERRCONNECT',
  ]);

  public constructor(protected readonly _app: Application) { }

  public isFatalError(error: string | Error): boolean {
    if (typeof error === 'string') {
      return this._fatalErrors.has(error);
    }

    if (error instanceof FatalErrorException) {
      return true;
    }

    if (error instanceof Exception) {
      const code = error.code ?? error.name;
      return this._fatalErrors.has(code);
    }

    return this._fatalErrors.has(error.name);
  }

  public addFatalError(error: string): this {
    this._fatalErrors.add(error);
    return this;
  }

  public async handle(error: Error): Promise<void> {
    const e = this._convertToException(error);
    await this.report(e);

    if (this.isFatalError(e)) {
      debug('Due to a fatal error, the application will shutdown:', error);
      await this._logFatal(e);
      await this._app.shutdown();
      process.exit(1);
    }

    await this._logError(e);
  }

  public reportUsing(error: string, callback: ReportCallback): this {
    if (! this._reporters.has(error)) {
      this._reporters.set(error, new Set());
    }

    this._reporters.get(error)?.add(callback);
    return this;
  }

  public async report(error: ReportableException): Promise<void> {
    if (! error.shouldReport) {
      return;
    }

    const reporters = this._reporters.get(error.name) ?? [];
    for (const reporter of reporters) {
      try {
        await reporter(error, this._app);
      } catch (error) {
        this._logError(new Error(String(error), { cause: error }));
      }
    }
  }

  protected _convertToException(error: Error): Exception {
    if (error instanceof Exception) {
      return error;
    }

    // @ts-expect-error Check if the error has a code property (some error has it)
    const code = Object.hasOwn(error, 'code') ? error.code : error.name;
    // @ts-expect-error Check if the error has a status property (some error has it)
    const status = Object.hasOwn(error, 'status') ? error.status : 500;

    return new Exception(error.message, {
      cause: error,
      code: code,
      status: status,
    });
  }

  protected async _logFatal(message: Error | string): Promise<void> {
    try {
      const logger = await this._resolveLogger();
      logger.critical(message);
    } catch {
      console.error('Logger is not available. Please ensure the logger module is registered.');
    }
  }

  protected async _logError(message: Error | string): Promise<void> {
    try {
      const logger = await this._resolveLogger();
      logger.error(message);
    } catch {
      console.error('Logger is not available. Please ensure the logger module is registered.');
    }
  }

  protected async _resolveLogger(): Promise<LoggerInterface> {
    return this._app.container.make('logger');
  }
}
