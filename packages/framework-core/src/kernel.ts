import type Application from '#/application';
import debug from '#/debug';
import type { StartCallback, BootstrapperInterface } from '#/types';

export default class Kernel {
  public constructor(
    protected readonly _app: Application,
  ) {
    //
  }

  public async bootstrapWith(bootstrappers: BootstrapperInterface[]): Promise<void> {
    debug('Bootstrapping application');

    for (const bootstrapper of bootstrappers) {
      await bootstrapper.bootstrap(this._app);
      debug(`Bootstrapped '${bootstrapper.constructor.name}'`);
    }

    debug('Application bootstrapped successfully');
  }

  public async run(callback?: StartCallback): Promise<void> {
    debug('Kernel is starting');

    if (callback) {
      debug('Executing start callback');
      const cleanupCallback = await callback(this._app);

      if (cleanupCallback) {
        this._app.onShutdown((app) => cleanupCallback(app));
      }
    }

    debug('Kernel started, application is booted');
  }
}
