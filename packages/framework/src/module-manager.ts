import type Application from '#/application';
import debug from '#/debug';
import type { ModuleInterface, ModuleLoaderInterface } from '#/types';

export enum ModuleState {
  REGISTERED,
  BOOTED,
  STARTED,
  SHUTDOWN,
}

export default class ModuleManager {
  protected _resolvedModules: Record<string, ModuleInterface> = {};
  protected _bootedModules: string[] = [];

  public constructor(protected readonly _app: Application) { }

  public isBooted(id: string): boolean {
    return this._bootedModules.includes(id);
  }

  public async register(loader: ModuleLoaderInterface): Promise<void> {
    debug('Registering modules');

    const modules = await loader.load(this._app);
    for (const module of modules) {
      if (Object.hasOwn(this._resolvedModules, module.id)) {
        debug(`Module '${module.id}' is already registered`);
        continue;
      }

      if (module.register) {
        module.register();
      }

      this._resolvedModules[module.id] = module;
      debug(`Registered module '${module.id}'`);

      if (this._app.isBooted) {
        this._bootModule(module);
        debug(`Booted module '${module.id}' after registration`);
      }
    }
  }

  public async boot(): Promise<void> {
    if (this._app.isBooted) {
      debug('Application is already booted, cannot boot modules again');
      return;
    }

    debug('Booting modules');
    for (const module of Object.values(this._resolvedModules)) {
      this._bootModule(module);
      debug(`Booted module '${module.id}'`);
    }
  }

  protected _bootModule(module: ModuleInterface): void {
    if (this.isBooted(module.id)) {
      debug(`Module '${module.id}' is already booted`);
      return;
    }

    if (module.boot) {
      module.boot();
      debug(`Booted module '${module.id}'`);
    } else {
      debug(`Module '${module.id}' does not have a boot method, skipping boot`);
    }

    this._bootedModules.push(module.id);
  }
}
