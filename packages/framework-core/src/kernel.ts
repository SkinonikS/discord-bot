import type Application from '#/application';
import debug from '#/debug';
import { ImportNotFoundException } from '#/exceptions';
import { importModule, instantiateIfNeeded } from '#/helpers';
import type { StartCallback, BootstrapperResolver } from '#/types';

export default class Kernel {
  protected _hasBeenBootstrapped = false;

  public constructor(
    protected readonly _app: Application,
  ) {
    //
  }

  public async bootstrapWith(bootstrappers: BootstrapperResolver[]): Promise<this> {
    if (this._hasBeenBootstrapped) {
      debug('Application has already been bootstrapped, skipping bootstrap');
      return this;
    }

    this._hasBeenBootstrapped = true;
    debug('Bootstrapping application');

    for (const bootstrapperResolver of bootstrappers) {
      try {
        const reolvedBootstrapper = await importModule(() => bootstrapperResolver());
        const bootstrapper = await instantiateIfNeeded(reolvedBootstrapper, this._app);

        await bootstrapper.bootstrap(this._app);
        debug(`Bootstrapped '${bootstrapper.constructor.name}'`);
      } catch (e) {
        if (e instanceof ImportNotFoundException) {
          console.error(`Failed to resolve bootstrapper: ${e.message}`);
          process.exit(1);
        }

        throw e;
      }
    }

    debug('Application bootstrapped successfully');
    return this;
  }

  public async run(callback?: StartCallback): Promise<this> {
    debug('Kernel is starting');

    if (callback) {
      debug('Executing start callback');
      const cleanupCallback = await callback(this._app);

      if (cleanupCallback) {
        this._app.onShutdown((app) => cleanupCallback(app));
      }
    }

    debug('Kernel started, application is booted');
    return this;
  }
}
