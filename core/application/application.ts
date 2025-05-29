import { Container } from 'inversify';
import { ServiceProviderManager } from '#core/application/providers/manager';
import { ServiceProviderInterface, ServiceProviderResolver } from '#core/application/types';
import Hooks from '@poppinss/hooks';
import path from 'node:path';
import debug from '#core/debug';

export enum Env {
  Development = 'development',
  Production = 'production',
}

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
  public readonly container = new Container({ autobind: true });
  protected _isBooted = false;
  protected readonly _serviceProviders = new ServiceProviderManager(this);
  protected readonly _hooks = new Hooks<{
    'shutdown': [[Application], [Application]];
    'shutingdown': [[Application], [Application]];
    'booting': [[Application], [Application]];
    'booted': [[Application], [Application]];
  }>();

  public constructor(basePath: string, public readonly env: Env = Env.Development) {
    this.path = new Path(basePath);
    this._registerCoreBindings();

    if (debug.enabled) {
      debug(`Application initialized with environment: ${this.env}`);
    }
  }

  public get isDevelopment(): boolean {
    return this.env === Env.Development;
  }

  public get isProduction(): boolean {
    return this.env === Env.Production;
  }

  public onShutdown(callback: (app: Application) => Promise<void>): void {
    this._hooks.add('shutdown', callback);
  }

  public onShutingdown(callback: (app: Application) => Promise<void>): void {
    this._hooks.add('shutingdown', callback);
  }

  public onBooting(callback: (app: Application) => Promise<void>): void {
    this._hooks.add('booting', callback);
  }

  public onBooted(callback: (app: Application) => Promise<void>): void {
    this._hooks.add('booted', callback);
  }

  public get isBooted(): boolean {
    return this._isBooted;
  }

  public async registerServiceProvider(serviceProviderResolvers: (ServiceProviderResolver | ServiceProviderInterface)[]): Promise<void> {
    await this._serviceProviders.register(serviceProviderResolvers);
  }

  public async boot(): Promise<void> {
    if (this._isBooted) {
      return;
    }

    await this._hooks.runner('booting').run(this);
    this._hooks.clear('booting');

    await this._serviceProviders.boot();
    this._isBooted = true;

    await this._hooks.runner('booted').run(this);
    this._hooks.clear('booted');
  }

  public async shutdown(): Promise<void> {
    if (! this._isBooted) {
      return;
    }

    await this._hooks.runner('shutingdown').run(this);
    this._hooks.clear('shutingdown');

    await this._serviceProviders.shutdown();
    this._isBooted = false;

    await this._hooks.runner('shutdown').run(this);
    this._hooks.clear('shutdown');
  }

  private _registerCoreBindings(): void {
    this.container.bind('Application').toConstantValue(this);
    this.container.bind('Container').toConstantValue(this.container);
  }
}

export default { Application, Path } as const;
