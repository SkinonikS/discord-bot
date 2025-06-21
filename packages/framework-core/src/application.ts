import EventEmitter from 'node:events';
import { Container } from '@adonisjs/fold';
import Hooks from '@poppinss/hooks';
import type { HookHandler } from '@poppinss/hooks/types';
import debug from '#/debug';
import { InvalidStateTransitionException } from '#/exceptions';
import ModuleManager from '#/module-manager';
import Path from '#/path';
import type { ApplicationConfig, ContainerBindings, EventMap, HooksMap, ModuleResolver } from '#/types';

export enum ApplicationState {
  INITIAL,
  BOOTED,
  STARTED,
  SHUTDOWN,
}

export default class Application
{
  public readonly path: Path;
  public readonly events = new EventEmitter<EventMap>();
  public readonly container = new Container<ContainerBindings>({ emitter: this.events });

  protected readonly _modules = new ModuleManager(this);
  protected readonly _hooks = new Hooks<HooksMap>();

  protected _isShuttingDown = false;
  protected _state = ApplicationState.INITIAL;
  protected _environment: string;
  protected _version: string;

  protected static _instance: Application | null = null;

  public constructor(config: ApplicationConfig) {
    this._version = config.version;
    this._environment = config.environment;
    this.path = new Path(config.appRoot);
    this.container.bindValue('app', this);
    this.container.bindValue('container', this.container);
    this.events.setMaxListeners(Infinity);
    debug('Application initialized with base path:', config.appRoot);
  }

  public get isStarted(): boolean {
    return this._state === ApplicationState.STARTED;
  }

  public get isBooted(): boolean {
    return [ApplicationState.BOOTED, ApplicationState.STARTED].includes(this._state);
  }

  public get modules() {
    return {
      all: () => this._modules.all(),
      register: (modules: ModuleResolver[]) => this._modules.register(modules),
    };
  }

  public get state(): ApplicationState {
    return this._state;
  }

  public get isShuttingDown(): boolean {
    return this._isShuttingDown;
  }

  public get version(): string {
    return this._version;
  }

  public get environment(): string {
    return this._environment;
  }

  public onShutdown(handler: HookHandler<[Application], [Application]>): void {
    debug('Registering \'shutdown\' hook');
    this._hooks.add('shutdown', handler);
  }

  public onBooting(handler: HookHandler<[Application], [Application]>): void {
    this._addBootHook(handler, 'booting');
  }

  public onBooted(handler: HookHandler<[Application], [Application]>): void {
    this._addBootHook(handler, 'booted');
  }

  public onStarting(handler: HookHandler<[Application], [Application]>): void {
    this._addStartHook(handler, 'starting');
  }

  public onStarted(handler: HookHandler<[Application], [Application]>): void {
    this._addStartHook(handler, 'started');
  }

  public isEnvironment(environment: string): boolean {
    debug('Checking if application environment is:', environment);
    return this._environment === environment;
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
    this._ensureState(ApplicationState.INITIAL);

    debug('Setting application environment to:', environment);
    this._environment = environment;
  }

  public async register(modules: ModuleResolver[]): Promise<void> {
    await this.modules.register(modules);
  }

  public async boot(): Promise<void> {
    debug('Booting application');
    this._ensureState(ApplicationState.INITIAL);

    await this._hooks.runner('booting').run(this);
    this._hooks.clear('booting');

    await this._modules.boot();

    await this._hooks.runner('booted').run(this);
    this._hooks.clear('booted');

    this._state = ApplicationState.BOOTED;
    debug('Application booted successfully');
  }

  public async start(): Promise<void> {
    debug('Starting application');
    this._ensureState(ApplicationState.BOOTED);

    await this._hooks.runner('starting').run(this);
    this._hooks.clear('starting');

    await this._modules.start();

    await this._hooks.runner('started').run(this);
    this._hooks.clear('started');

    this._state = ApplicationState.STARTED;
    debug('Application started successfully');
  }

  public async shutdown(): Promise<void> {
    if (this._isShuttingDown) {
      debug('Application is already shutting down, ignoring shutdown request');
      return;
    }

    if (! this.isStarted) {
      debug('Application is not started, skipping shutdown');
      return;
    }

    debug('Shutting down application');
    this._isShuttingDown = true;
    await this._modules.shutdown();

    await this._hooks.runner('shutdown').runReverse(this);
    this._hooks.clear('shutdown');

    this._isShuttingDown = false;
    this._state = ApplicationState.SHUTDOWN;
    debug('Application shutdown successfully');
  }

  protected _ensureState(expectedState: ApplicationState): void {
    if (this._state !== expectedState) {
      debug(`Invalid state transition from ${this._state} to ${expectedState}`);
      throw new InvalidStateTransitionException(ApplicationState[this._state], ApplicationState[expectedState]);
    }
  }

  protected _addStartHook(handler: HookHandler<[Application], [Application]>, hookName: 'starting' | 'started'): void {
    this._addHookIf((app) => app._state === ApplicationState.STARTED, handler, hookName);
  }

  protected _addBootHook(handler: HookHandler<[Application], [Application]>, hookName: 'booting' | 'booted'): void {
    this._addHookIf(() => this.isBooted, handler, hookName);
  }

  protected _addHookIf(shouldCall: (app: Application) => boolean, handler: HookHandler<[Application], [Application]>, hookName: keyof HooksMap): void {
    debug(`Registering '${hookName}' hook`);

    if (shouldCall(this)) {
      void handler(this);
      return;
    }

    this._hooks.add(hookName, handler);
  }
}
