import EventEmitter from 'node:events';
import { Container } from '@adonisjs/fold';
import Hooks from '@poppinss/hooks';
import type { HookHandler } from '@poppinss/hooks/types';
import debug from '#/debug';
import ModuleManager from '#/module-manager';
import Path from '#/path';
import type { ContainerBindings, EventMap, HooksMap, ModuleLoaderInterface } from '#/types';

export default class Application
{
  public readonly path: Path;
  public readonly container = new Container<ContainerBindings>();
  public readonly events = new EventEmitter<EventMap>();
  public readonly modules = new ModuleManager(this);

  protected readonly _hooks = new Hooks<HooksMap>();

  protected _isBooted = false;
  protected _environment = 'development';
  protected _version = 'Unknown';

  protected static _instance: Application | null = null;

  public constructor(basePath: string, version?: string) {
    this._version = version || 'Unknown';
    this.path = new Path(basePath);

    this.container.bindValue(Application, this);
    this.container.bindValue(Container, this.container);
    this.container.alias('app', Application);
    this.container.alias('container', Container);

    this.events.setMaxListeners(Infinity);
    debug('Application initialized with base path:', basePath);
  }

  public get version(): string {
    return this._version;
  }

  public onShutdown(
    handler: HookHandler<[Application], [Application]>,
  ): void {
    debug('Registering shutdown hook');
    this._hooks.add('shutdown', handler);
  }

  public onBooting(
    handler: HookHandler<[Application], [Application]>,
  ): void {
    debug('Registering booting hook');
    this._hooks.add('booting', handler);
  }

  public onBooted(
    handler: HookHandler<[Application], [Application]>,
  ): void {
    if (this._isBooted) {
      debug('Application is already booted, executing callback immediately');
      void handler(this);
      return;
    }

    debug('Registering booted hook');
    this._hooks.add('booted', handler);
  }

  public isEnvironment(environment: string): boolean {
    if (! this._isBooted) {
      debug('Cannot check environment when application is not booted');
      return false;
    }

    debug('Checking if application environment is:', environment);
    return this._environment === environment;
  }

  public get environment(): string {
    return this._environment;
  }

  public get isBooted(): boolean {
    return this._isBooted;
  }

  public static setInstance(app: Application): void {
    debug('Application instance set successfully');
    this._instance = app;
  }

  public static getInstance(): Application {
    if (! this._instance) {
      debug('Application instance is not initialized');
      throw new Error('Application instance is not initialized');
    }

    return this._instance;
  }

  public setEnvionment(environment: string): void {
    if (this._isBooted) {
      debug('Cannot change environment after application has booted');
      return;
    }

    debug('Setting application environment to:', environment);
    this._environment = environment;
  }

  public register(moduleLoader: ModuleLoaderInterface): Promise<void> {
    return this.modules.register(moduleLoader);
  }

  public async boot(): Promise<void> {
    if (this._isBooted) {
      debug('Application is already started or booted, cannot boot again');
      return;
    }

    debug('Booting application');
    this.events.emit('app:booting', this);
    await this._hooks.runner('booting').run(this);
    this._hooks.clear('booting');

    await this.modules.boot();
    this._isBooted = true;

    this.events.emit('app:booted', this);
    await this._hooks.runner('booted').run(this);
    this._hooks.clear('booted');
    debug('Application booted successfully');
  }

  public async shutdown(): Promise<void> {
    if (! this._isBooted) {
      debug('Application is not started, nothing to shutdown');
      return;
    }

    this._isBooted = false;

    this.events.emit('app:shutdown', this);
    await this._hooks.runner('shutdown').runReverse(this);
    this._hooks.clear('shutdown');
    debug('Application shutdown successfully');
  }
}
