import debug from '#root/debug';
import type Application from '#src/app/application';
import type { StartCallback, BootstrapperResolver } from '#src/kernel/types';
import { ImportNotFoundException } from '#src/utils/exceptions';
import { importModule, instantiateIfNeeded } from '#src/utils/helpers';

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
