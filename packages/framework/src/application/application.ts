import path from 'node:path';
import { Container } from '@adonisjs/fold';
import Hooks from '@poppinss/hooks';
import type { HookHandler } from '@poppinss/hooks/types';
import debug from '#/debug';
import type { ContainerBindings, HooksState, ServiceProviderInterface, ServiceProviderResolver } from '#/types';
import ServiceProviderManager from '#application/service-provider-manager';

export class Path {
  public constructor(
    public readonly appRoot: string,
  ) {
    //
  }

  public resolve(...paths: string[]): string {
    return path.resolve(this.appRoot, ...paths);
  }

  public modules(...paths: string[]): string {
    return this.resolve('modules', ...paths);
  }

  public public(...paths: string[]): string {
    return this.resolve('public', ...paths);
  }

  public logs(...paths: string[]): string {
    return this.resolve('logs', ...paths);
  }
}

export class Application
{
  public readonly path: Path;
  public readonly container = new Container<ContainerBindings>();

  protected _isBooted = false;
  protected _env = 'development';
  protected readonly _serviceProviders = new ServiceProviderManager(this);
  protected readonly _hooks = new Hooks<{
    'shutdown': HooksState;
    'shutingdown': HooksState;
    'booting': HooksState;
    'booted': HooksState;
  }>();

  public static _instance: Application | null = null;

  public constructor(basePath: string) {
    this.path = new Path(basePath);
    this.container.bindValue('app', this);
    debug('Application initialized with base path:', basePath);
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

  public setEnvionment(env: string): void {
    if (this._isBooted) {
      debug('Cannot change environment after application has booted');
      return;
    }

    debug('Setting application environment to:', env);
    this._env = env;
  }

  public get env(): string {
    return this._env;
  }

  public get isDevelopment(): boolean {
    return ['development', 'dev'].includes(this._env);
  }

  public get isProduction(): boolean {
    return ['production', 'prod'].includes(this._env);
  }

  public onShutdown(
    handler: HookHandler<[Application], [Application]>,
  ): void {
    debug('Registering shutdown hook');
    this._hooks.add('shutdown', handler);
  }

  public onShutingdown(
    handler: HookHandler<[Application], [Application]>,
  ): void {
    debug('Registering shutting down hook');
    this._hooks.add('shutingdown', handler);
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

  public get isBooted(): boolean {
    return this._isBooted;
  }

  public async registerServiceProvider(serviceProviderResolvers: (ServiceProviderResolver | ServiceProviderInterface)[]): Promise<void> {
    debug('Registering service providers');
    await this._serviceProviders.register(serviceProviderResolvers);
  }

  public async boot(): Promise<void> {
    if (this._isBooted) {
      debug('Application is already booted');
      return;
    }

    debug('Booting application...');

    await this._hooks.runner('booting').run(this);
    this._hooks.clear('booting');

    await this._serviceProviders.boot();

    await this._hooks.runner('booted').run(this);
    this._hooks.clear('booted');

    this._isBooted = true;
    debug('Application booted successfully');
  }

  public async shutdown(): Promise<void> {
    if (! this._isBooted) {
      debug('Application is not booted, nothing to shutdown');
      return;
    }

    debug('Shutting down application...');

    await this._hooks.runner('shutingdown').run(this);
    this._hooks.clear('shutingdown');

    await this._serviceProviders.shutdown();

    await this._hooks.runner('shutdown').run(this);
    this._hooks.clear('shutdown');

    this._isBooted = false;
    debug('Application shutdown successfully');
  }
}

export default { Application, Path } as const;
