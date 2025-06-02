import type { ServiceProviderResolver, ServiceProviderInterface } from '#/types';
import type { Application } from '#application/application';

export default class ServiceProviderManager {
  protected _resolvedServiceProviders: ServiceProviderInterface[] = [];
  protected _bootedServiceProviders: string[] = [];

  public constructor(
    protected readonly _app: Application,
  ) {
    //
  }

  public async register(serviceProviderResolvers: (ServiceProviderResolver | ServiceProviderInterface)[]): Promise<void> {
    for (const serviceProviderResolver of serviceProviderResolvers) {
      let serviceProvider: ServiceProviderInterface;

      if (typeof serviceProviderResolver === 'function') {
        const ServiceProvider = (await serviceProviderResolver()).default;
        serviceProvider = new ServiceProvider(this._app);
      } else {
        serviceProvider = serviceProviderResolver;
      }

      this._handleServiceProvider(serviceProvider);
    }
  }

  public async boot(): Promise<void> {
    for (const serviceProvider of this._resolvedServiceProviders) {
      await this._bootServiceProvider(serviceProvider);
    }
  }

  public isBooted(providerClass: string): boolean {
    return this._bootedServiceProviders.includes(providerClass);
  }

  public async shutdown(): Promise<void> {
    for (const serviceProvider of this._resolvedServiceProviders) {
      if (serviceProvider.shutdown) {
        await serviceProvider.shutdown();
      }
    }

    this._bootedServiceProviders = [];
  }

  protected async _bootServiceProvider(provider: ServiceProviderInterface): Promise<void> {
    if (provider.boot && ! this.isBooted(provider.constructor.name)) {
      await provider.boot();
      this._bootedServiceProviders.push(provider.constructor.name);
    }
  }

  protected async _handleServiceProvider(serviceProvider: ServiceProviderInterface): Promise<void> {
    this._resolvedServiceProviders.push(serviceProvider);

    if (serviceProvider.register) {
      serviceProvider.register();
    }

    if (this._app.isBooted) {
      await this._bootServiceProvider(serviceProvider);
    }
  }
}
