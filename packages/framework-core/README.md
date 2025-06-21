# Framework Core
The foundational package of the Discord Bot Framework, providing a robust architecture for building modular, scalable applications with dependency injection, lifecycle management, and type safety.

## Quick Start
Basic Application Setup
```typescript
import { 
  Application,
  Kernel,
} from '@framework/core';

// Create application
const app = new Application({
  appRoot: process.cwd(),
  environment: 'development',
  version: '1.0.0'
});

// Set global instance
Application.setInstance(app);

// Create and run kernel
const kernel = new Kernel(app);

// Define boostrappers
await kernel.bootstrapWith([
  // Import from '@framework/core/bootstrappers'
]);

await kernel.run(async (app) => {
  console.log('Application started successfully!');
  
  return async (app) => {
    console.log('Cleaning up...');
  };
});
```

## Kernel
The `Kernel` class manages the bootstrapping and lifecycle of the application, allowing you to define bootstrappers that run during the application startup.

```typescript
import { Kernel } from '@framework/core';

const kernel = new Kernel(app);

// Define bootstrappers
await kernel.bootstrapWith([
  // Add your bootstrappers here
]);

// Run the kernel
await kernel.run(async (app) => {
  console.log('Application started successfully!');
  
  return async (app) => {
    console.log('Cleaning up...');
  };
});
```

### Bootstrappers
Control application initialization with bootstrappers. Basic bootstrappers can be found in `@framework/core/bootstrappers`. You can also create custom bootstrappers to handle specific initialization logic. 

Bootstrappers are classes that execute during the initialize phase of the application lifecycle, allowing you to set up global services, configurations, or any other necessary setup before the application starts.
```typescript
import { BootstrapperInterface, Application } from '@framework/core';

export default class CustomBootstrapper implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void> {
    // Custom initialization logic
    console.log('Custom bootstrapper executed');
    
    // Register global services
    app.container.bindValue('customService', new CustomService());
  }
}
```

#### Built-in Bootstrappers

The framework predefines several bootstrappers to handle common tasks:

- **`@framework/core/bootstrappers/handle-errors`** - Sets up global error handling
- **`@framework/core/bootstrappers/load-environment-variables`** - Loads environment variables from `.env`
- **`@framework/core/bootstrappers/load-configuration`** - Loads configuration files
- **`@framework/core/bootstrappers/register-modules`** - Registers application modules
- **`@framework/core/bootstrappers/boot-modules`** - Boots all registered modules

## Application
The `Application` class is the heart of the framework, managing state, modules, and the dependency injection container.
```typescript
import { Application, ApplicationState } from '@framework/core';

const app = new Application({
  appRoot: '/path/to/app',
  environment: 'production',
  version: '2.0.0'
});

// Check application state
console.log(app.state === ApplicationState.INITIAL); // true
console.log(app.isBooted); // false
console.log(app.isStarted); // false

// Boot the application
await app.boot();
console.log(app.isBooted); // true

// Start the application
await app.start();
console.log(app.isStarted); // true
```

### IoC Container
Built on `@adonisjs/fold`, providing powerful dependency injection capabilities:

```typescript
// Register services
app.container.bindValue('database', new DatabaseService());
app.container.singleton('logger', () => new LoggerService());

// Resolve services
const database = await app.container.make('database');
const logger = await app.container.make('logger');

// Type-safe container bindings
declare module '@framework/core' {
  interface ContainerBindings {
    database: DatabaseService;
    logger: LoggerService;
  }
}
```

### Modular Architecture
Create reusable, self-contained modules:
```typescript
import { ModuleInterface, Application } from '@framework/core';

declare module '@framework/core' {
  interface ContainerBindings {
    'database.connection': DatabaseConnection;
  }
}

// Configuration bindings
declare module '@framework/core' {
  interface ConfigBindings {
    database: DatabaseConfig;
  }
}

// Event map
declare module '@framework/core' {
  interface EventMap {
    'database:connected': [connection: DatabaseConnection];
  }
}

export default class DatabaseModule implements ModuleInterface {
  public readonly id = 'database';
  public readonly author = 'Your Name';
  public readonly version = '1.0.0';

  public register(app: Application): void {
    // Register services during the register phase
    app.container.singleton('database', (container) => new DatabaseService(container));
  }

  public async boot(app: Application): Promise<void> {
    // Initialize services after all modules are registered
    const database = await app.container.make('database');
    await database.initialize();
  }

  public async start(app: Application): Promise<void> {
    // Initialize services after all modules are registered
    const database = await app.container.make('database');
    await database.connect();
  }

  public async shutdown(app: Application): Promise<void> {
    // Cleanup when application shuts down
    const database = await app.container.make('database');
    await database.disconnect();
  }
}
```

### Error Handling
Comprehensive error management with the ErrorHandler:
```typescript
import { getErrorHandler, report } from '@framework/core';

// Get error handler
const errorHandler = await getErrorHandler();

// Add custom error reporter
errorHandler.reportUsing('MyCustomError', async (error, app) => {
  console.log('Custom error reporter:', error);
});

// Only report errors
errorHandler.report(new Error('Something went wrong'));

// Handle errors globally
errorHandler.handle(new Error('Unhandled error'));

// Add fatal error types
errorHandler.addFatalError('CRITICAL_DATABASE_ERROR');
```

### Lifecycle Hooks
React to application lifecycle events:

```typescript
// Boot hooks
app.onBooting((app) => {
  console.log('Application is booting...');
});

app.onBooted((app) => {
  console.log('Application booted successfully');
});

// Start hooks
app.onStarting((app) => {
  console.log('Application is starting...');
});

app.onStarted((app) => {
  console.log('Application started successfully');
});

// Shutdown hooks
app.onShutdown((app) => {
  console.log('Application is shutting down...');
});
```

## API Reference

### Application Class

#### Properties
- `path: Path` - Path utilities for the application
- `container: Container` - Dependency injection container
- `events: EventEmitter` - Event emitter for application events
- `modules` - Module management interface
- `state: ApplicationState` - Current application state
- `version: string` - Application version
- `environment: string` - Current environment

#### Methods
- `boot(): Promise<void>` - Boot the application
- `start(): Promise<void>` - Start the application
- `shutdown(): Promise<void>` - Gracefully shutdown
- `register(modules): Promise<void>` - Register modules
- `setEnvironment(env): void` - Set environment
- `isEnvironment(env): boolean` - Check current environment

#### Static Methods
- `setInstance(app): void` - Set global instance
- `getInstance(): Application` - Get global instance

### ConfigRepository Class

#### Methods
- `get<K>(key: K): T` - Get configuration value
- `set<K>(key: K, value: T): this` - Set configuration value
- `has(key: string): boolean` - Check if key exists
- `merge(config): this` - Merge configuration
- `all(): ConfigBindings` - Get all configuration

### ErrorHandler Class

#### Methods
- `handle(error): Promise<void>` - Handle errors
- `report(error): Promise<void>` - Report errors
- `reportUsing(error, callback): this` - Add error reporter
- `addFatalError(error): this` - Add fatal error type
- `isFatalError(error): boolean` - Check if error is fatal

### Utility Functions

- `defineBaseConfig<T>(key, config): BaseConfig<T>` - Define configuration
- `defineKernelConfig(config): KernelConfig` - Define kernel configuration
- `getApplication(): Application` - Get global application instance
- `getConfig(app?): Promise<ConfigRepository>` - Get configuration repository
- `getErrorHandler(app?): Promise<ErrorHandler>` - Get error handler
- `report(error, app?): Promise<void>` - Report errors
- `importModule<T>(resolver, ...args): Promise<T>` - Import and resolve modules
- `instantiateIfNeeded<T>(resolver, app): Promise<T>` - Instantiate if not already done

# License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

