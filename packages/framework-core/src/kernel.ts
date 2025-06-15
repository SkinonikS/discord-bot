import type { LoggerInterface } from '@module/logger';
import type Application from '#/application';
import debug from '#/debug';
import { type BootstrapperLoaderInterface, type CleanupCallback } from '#/types';

export default class Kernel {
  protected _cleanupCallback?: CleanupCallback;

  public constructor(
    protected readonly _app: Application,
    protected readonly _bootstrappersLoader: BootstrapperLoaderInterface,
  ) {
    //
  }

  public async run(callback?: (app: Application) => Promise<void> | void): Promise<void> {
    if (this._app.isBooted) {
      debug('Application is already booted, skipping bootstrapping');
      return;
    }

    debug('Booting application...');
    this._registerHandlers();
    await this._runBootstrappers();

    if (callback) {
      debug('Executing custom boot callback...');
      this._cleanupCallback = await callback(this._app) ?? undefined;
    }

    debug('Application booted successfully');
  }

  public async shutdown(): Promise<void> {
    if (! this._app.isBooted) {
      debug('Application is not booted, nothing to shutdown');
      return;
    }

    debug('Shutting down application...');
    await this._app.shutdown();
    this._unregisterHandlers();

    if (this._cleanupCallback) {
      debug('Executing cleanup callback...');
      await this._cleanupCallback(this._app);
      this._cleanupCallback = undefined;
    }

    debug('Application shutdown complete');
  }

  protected async _runBootstrappers(): Promise<void> {
    const bootstarppers = await this._bootstrappersLoader.load(this._app);

    for (const bootstrapper of bootstarppers) {
      await bootstrapper.bootstrap(this._app);
      debug(`Bootstrapped '${bootstrapper.constructor.name}'`);
    }
  }

  protected _unregisterHandlers(): void {
    process.off('SIGTERM', this._signalHandler.bind(this));
    process.off('SIGINT', this._signalHandler.bind(this));
    process.off('uncaughtException', this._errorHandler.bind(this));
    process.off('unhandledRejection', this._errorHandler.bind(this));
    debug('Signal handlers unregistered');
  }

  protected _registerHandlers(): void {
    process.on('SIGTERM', this._signalHandler.bind(this));
    process.on('SIGINT', this._signalHandler.bind(this));
    process.on('uncaughtException', this._errorHandler.bind(this));
    process.on('unhandledRejection', this._errorHandler.bind(this));
    debug('Signal handlers registered');
  }

  protected async _signalHandler(): Promise<void> {
    const reason = 'Termination signal received, shutting down gracefully...';

    if (this._app.container.hasBinding('logger')) {
      const logger: LoggerInterface = await this._app.container.make('logger');
      logger.info(reason);
    } else {
      console.log(reason);
    }

    await this.shutdown();
    process.exit(0);
  }

  protected async _errorHandler(reason: unknown): Promise<void> {
    const error = reason instanceof Error ? reason : new Error(String(reason));

    if (this._app.container.hasBinding('logger')) {
      const logger: LoggerInterface = await this._app.container.make('logger');
      logger.error(error);
    } else {
      console.error('An error occurred:', error);
    }

    await this.shutdown();
    process.exit(1);
  }
}
