import { debug } from 'console';
import type { LoggerInterface } from '@module/logger';
import { Exception } from '@poppinss/exception';
import type Application from '#/application';
import { ConfigNotFoundException } from '#/exceptions';
import type { ReportableException, ReportCallback } from '#/types';

export default class ErrorHandler {
  protected readonly _reporters: Map<string, Set<ReportCallback>> = new Map();

  protected readonly _fatalErrors: Set<string> = new Set([
    ConfigNotFoundException.code,
  ]);

  public constructor(protected readonly _app: Application) { }

  public isFatalError(error: string): boolean {
    return this._fatalErrors.has(error);
  }

  public addFatalError(error: string): this {
    this._fatalErrors.add(error);
    return this;
  }

  public async handle(error: Error): Promise<void> {
    const errorCode = error instanceof Exception
      ? error.code ?? ''
      : error.constructor.name;

    await this._logError(error);
    await this.report(error);

    if (this.isFatalError(errorCode)) {
      debug('Due to a fatal error, the application will shutdown:', error);
      await this._app.shutdown();
    }
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

  protected async _logError(error: Error): Promise<void> {
    try {
      const logger: LoggerInterface = await this._app.container.make('logger');
      logger.critical(error);
    } catch {
      console.error('Error logging error:', error);
    }
  }
}
