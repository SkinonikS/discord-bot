# Discord Bot Framework

A robust TypeScript framework for building modular, scalable Discord bots.

## Extending the Framework

ServiceProviders are the core extension mechanism of the framework. They allow you to register services and other components in the application's dependency injection container.

### How ServiceProviders Work

Each ServiceProvider has the following lifecycle:

1. **register()** - Adding services to the dependency injection container
2. **boot()** - Initializing services after all dependencies have been registered
3. **shutdown()** - Properly terminating services when the application stops

### Creating a ServiceProvider
```typescript
import { Application } from '#core/application/application';
import { ServiceProviderInterface } from '#core/application/types';

export default class MyServiceProvider implements ServiceProvider {
  public constructor(protected _app: Application) {}

  public register(): void {
    // Register services in the container
    this._app.container.bind('MyService').toConstantValue({
      someMethod: () => console.log('Hello from MyService')
    });
  }

  public async boot(): Promise<void> {
    // Initialize after all services are registered
    const logger = this._app.container.get('Logger');
    logger.info('MyServiceProvider successfully booted');
  }

  public async shutdown(): Promise<void> {
    // Release resources during termination
    const logger = this._app.container.get('Logger');
    logger.info('MyServiceProvider shutdown');
  }
}
```

### Registering a ServiceProvider
```typescript
// In bootstrap/app.ts
import { defineConfig } from '#core/application/define-config';

export default defineConfig({
  configFiles: [
    //
  ],
  serviceProviders: [
    // Other service providers
    () => import('#path/to/service-provider'),
  ],
});
```

### Using Services
```typescript
// Somewhere in your code
const myService = app.container.get('MyService');
myService.someMethod(); // Outputs "Hello from MyService"
```

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
