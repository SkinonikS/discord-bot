import { Application } from '#core/application/application';
import { ServiceProviderResolver, ServiceProviderInterface } from '#core/application/types';

export class ServiceProviderManager {
  protected _resolvedServiceProviders: ServiceProviderInterface[] = [];
  protected _bootedServiceProviders: string[] = [];

  public constructor(
    protected readonly _app: Application,
  ) {
    //
  }

  public async register(serviceProviderResolvers: (ServiceProviderResolver | ServiceProviderInterface)[]): Promise<void> {
    for (const serviceProviderResolver of serviceProviderResolvers) {
      if (typeof serviceProviderResolver === 'object') {
        this._resolvedServiceProviders.push(serviceProviderResolver);

        if (serviceProviderResolver.register) {
          serviceProviderResolver.register();
        }

        if (this._app.isBooted) {
          await this._bootServiceProvider(serviceProviderResolver);
        }

        continue;
      }

      const { default: ServiceProvider } = await serviceProviderResolver();

      if (! ServiceProvider) {
        throw new Error(`Service provider resolver did not return a valid service provider: ${serviceProviderResolver.name}`);
      }

      const serviceProvider = new ServiceProvider(this._app);
      this._resolvedServiceProviders.push(serviceProvider);

      if (serviceProvider.register) {
        serviceProvider.register();
      }

      if (this._app.isBooted) {
        await this._bootServiceProvider(serviceProvider);
      }
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
}

export default { ServiceProviderManager } as const;
