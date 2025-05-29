import { Application } from '#core/application/application';
import { ServiceProviderInterface } from '#core/application/types';
import { LoggerFactoryInterface, LoggerInterface } from '#core/application/types';
import { Client } from 'discord.js';

export abstract class AbstractServiceProvider implements ServiceProviderInterface {
  protected readonly _logger: LoggerInterface;

  public constructor(
    protected readonly _app: Application,
  ) {
    this._logger = this._loggerFactory.createLogSource(this.name());
  }

  protected name(): string {
    return this.constructor.name;
  }

  public get _discord() {
    return this._app.container.get<Client>('Discord.Client');
  }

  protected get _loggerFactory(): LoggerFactoryInterface {
    return this._app.container.get<LoggerFactoryInterface>('Logger.Factory');
  }

  public register?(): void {
    // Default implementation - can be overridden by subclasses
  }

  public boot?(): Promise<void> | void {
    // Default implementation - can be overridden by subclasses
  }

  public shutdown?(): Promise<void> | void {
    // Default implementation - can be overridden by subclasses
  }
}
