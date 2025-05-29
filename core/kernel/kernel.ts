import { BootstrapperResolver } from '#core/kernel/types';
import { Application } from '#core/application/application';
import { LoggerFactoryInterface, LoggerInterface } from '#core/application/types';

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

    this._registerErrorHandlers();

    await this._runBootstrappers();

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

    await this._app.shutdown();

    if (this._cleanupCallback) {
      await this._cleanupCallback(this._app);
    }
  }

  protected _registerErrorHandlers(): void {
    const _terminate = async (reason: unknown) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this._logger.error(error);
      await this.terminate();
      process.exit(1);
    };

    process.on('uncaughtException', (err) => void _terminate(err));
    process.on('unhandledRejection', (reason) => void _terminate(reason));
  }

  protected _registerTerminationSignals(): void {
    const _terminate = async () => {
      await this.terminate();
      process.exit(0);
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
