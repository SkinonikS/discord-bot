import type Application from '#/application';
import debug from '#/debug';
import { importModule } from '#/helpers';
import type { ModuleInterface, ModuleResolver } from '#/types';

export default class ModuleManager {
  protected _resolvedModules: Record<string, ModuleInterface> = {};

  public constructor(protected readonly _app: Application) { }

  public all(): ModuleInterface[] {
    return Object.values(this._resolvedModules);
  }

  public async register(modules: ModuleResolver[]): Promise<void> {
    debug('Registering modules');

    for (const moduleResolver of modules) {
      const resolvedModule = await importModule(() => moduleResolver());

      const module = resolvedModule instanceof Function
        ? new resolvedModule()
        : resolvedModule;

      if (Object.hasOwn(this._resolvedModules, module.id)) {
        debug(`Module '${module.id}' is already registered`);
        continue;
      }

      await this._registerModule(module);

      if (this._app.isBooted) {
        await this._bootModule(module);
      }

      if (this._app.isStarted) {
        await this._startModule(module);
      }
    }
  }

  public async start(): Promise<void> {
    debug('Starting modules');
    for (const module of Object.values(this._resolvedModules)) {
      await this._startModule(module);
    }
  }

  public async boot(): Promise<void> {
    debug('Booting modules');
    for (const module of Object.values(this._resolvedModules)) {
      await this._bootModule(module);
    }
  }

  public async shutdown(): Promise<void> {
    debug('Shutting down');
    for (const module of Object.values(this._resolvedModules).reverse()) {
      await this._shutdownModule(module);
    }
  }

  protected async _registerModule(module: ModuleInterface): Promise<void> {
    await this._callModuleMethod(module, 'register');
    this._resolvedModules[module.id] = module;
  }

  protected async _shutdownModule(module: ModuleInterface): Promise<void> {
    return this._callModuleMethod(module, 'shutdown');
  }

  protected async _startModule(module: ModuleInterface): Promise<void> {
    return this._callModuleMethod(module, 'start');
  }

  protected async _bootModule(module: ModuleInterface): Promise<void> {
    return this._callModuleMethod(module, 'boot');
  }

  protected async _callModuleMethod(module: ModuleInterface, method: 'boot' | 'start' | 'shutdown' | 'register'): Promise<void> {
    if (module[method]) {
      await module[method](this._app);
      debug(`Called '${method}' on module '${module.id}'`);
    } else {
      debug(`Module '${module.id}' does not have a '${method}' method, skipping call`);
    }
  }
}
