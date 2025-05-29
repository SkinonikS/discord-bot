import { BootstrapperResolver } from '#core/kernel/types';
import { Application } from '#core/application/application';
import { fromPromise } from 'neverthrow';
import { LoggerFactoryInterface, LoggerInterface } from '#core/application/types';
import { ConfigRepository } from '#core/application/config/config-repository';

export type CleanupCallback = (app: Application) => void | Promise<void>;
export type StartCallback = (app: Application) => (CleanupCallback | Promise<CleanupCallback>) | (Promise<void> | void);

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

    this._logger.info('Booting application');
    this._registerErrorHandlers();

    await this._runBootstrappers();

    this._logger.debug('Registering termination signals');
    this._registerTerminationSignals();

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

    this._logger.info('Shutting down application');

    const res = await fromPromise(this._app.shutdown(), (err) => {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return new Error(`Failed to shutdown application: ${errorMessage}`);
    });

    if (res.isErr()) {
      throw res.error;
    }

    if (this._cleanupCallback) {
      await this._cleanupCallback(this._app);
    }
  }

  protected _registerErrorHandlers(): void {
    const _terminate = (reason: unknown) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this._logger.error(error);
      process.exit(1);
    };

    process.on('uncaughtException', (err) => void _terminate(err));
    process.on('unhandledRejection', (reason) => void _terminate(reason));
  }

  protected _registerTerminationSignals(): void {
    const _terminate = async () => {
      this._logger.info('Received termination signal, shutting down application');
      await this.terminate();
    };

    process.on('SIGTERM', () => void _terminate());
    process.on('SIGINT', () => void _terminate());
  }

  protected async _runBootstrappers(): Promise<void> {
    for (const bootstrapperResolver of this._bootstrappers) {
      const Bootstrapper = (await bootstrapperResolver()).default;

      if (! Bootstrapper) {
        throw new Error(`Bootstrapper "${bootstrapperResolver.constructor.name}" does not have a default export`);
      }

      const bootstrapper = new Bootstrapper();
      await bootstrapper.bootstrap(this._app);
    }
  }

  protected get _logger(): LoggerInterface {
    const loggerFactory = this._app.container.get<LoggerFactoryInterface>('Logger.Factory');
    return loggerFactory.createLogSource('KERNEL');
  }
}

export default { Kernel } as const;
