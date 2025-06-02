import type { LoggerInterface } from '@package/module-logger';
import type { BootstrapperResolver, CleanupCallback, StartCallback } from '#/types';
import type { Application } from '#application/application';

export class Kernel {
  protected _cleanupCallback?: CleanupCallback;
  protected _bootstrappers: BootstrapperResolver[] = [];

  public constructor(
    protected readonly _app: Application,
  ) {
    //
  }

  public use(bootstrappers: BootstrapperResolver[]): this {
    this._bootstrappers.push(...bootstrappers);

    return this;
  }

  public async run(callback?: StartCallback): Promise<void> {
    if (this._app.isBooted) {
      return;
    }

    this._registerErrorHandler();
    this._registerTerminationSignals();

    await this._runBootstrappers();

    if (callback) {
      const cleanupCallback = await callback(this._app);

      if (cleanupCallback) {
        this._cleanupCallback = cleanupCallback;
      }
    }
  }

  public async terminate(): Promise<void> {
    if (! this._app.isBooted) {
      return;
    }

    await this._app.shutdown();

    if (this._cleanupCallback) {
      await this._cleanupCallback(this._app);
    }
  }

  protected _registerErrorHandler(): void {
    const _terminate = async (reason: unknown) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));

      if (this._app.container.hasBinding('logger')) {
        const logger = await this._app.container.make('logger') as LoggerInterface;
        logger.error(error);
      } else {
        console.error('An error occurred:', error);
      }

      await this.terminate();
      process.exit(1);
    };

    process.on('uncaughtException', (err) => void _terminate(err));
    process.on('unhandledRejection', (reason) => void _terminate(reason));
  }

  protected _registerTerminationSignals(): void {
    const _terminate = async () => {
      const reason = 'Termination signal received, shutting down gracefully...';

      if (this._app.container.hasBinding('logger')) {
        const logger = await this._app.container.make('logger') as LoggerInterface;
        logger.info(reason);
      } else {
        console.log(reason);
      }

      await this.terminate();
      process.exit(0);
    };

    process.on('SIGTERM', () => void _terminate());
    process.on('SIGINT', () => void _terminate());
  }

  protected async _runBootstrappers(): Promise<void> {
    for (const bootstrapperResolver of this._bootstrappers) {
      const Bootstrapper = (await bootstrapperResolver());

      if ('default' in Bootstrapper) {
        await new Bootstrapper.default().bootstrap(this._app);
      } else {
        await Bootstrapper.bootstrap(this._app);
      }
    }
  }
}

export default { Kernel } as const;
