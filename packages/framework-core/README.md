# Framework Core
The foundational package of the Discord Bot Framework, providing a robust architecture for building modular, scalable applications with dependency injection, lifecycle management, and type safety.

## Core Components
The framework provides two core components that you can use to build your application:
* `Application` - The main application class that manages state, modules, and the IoC container.
* `Kernel` - Manages the bootstrapping and lifecycle of the application.

### Application
The `Application` class is the heart of the framework, managing state, modules, and the dependency injection container.

```ts
import { Application, ApplicationState } from '@framework/core/app';

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

#### IoC Container
Built on `@adonisjs/fold`, providing powerful dependency injection capabilities:

```ts
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

  interface ConfigBindings {
    database: DatabaseConfig;
  }
}
```

#### Modules
Create reusable, self-contained modules:

```ts
import { ModuleInterface, Application } from '@framework/core/app';

declare module '@framework/core/app' {
  // Container bindings
  interface ContainerBindings {
    'database.connection': DatabaseConnection;
  }

  // Configuration bindings
  interface ConfigBindings {
    database: DatabaseConfig;
  }

  // Event map
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

#### Error Handling
Error handling is managing application errors and report them if they are not handled by developer. Error handler is desined to be an last-resort, so it will not handle errors that are already handled by developer. Basically, if error handler catches the error, it means that developer did not handle it properly.

In application there is a two types of errors: **Fatal** and **Non-Fatal**.

* **Fatal errors** are critical errors that place the application in an unrecoverable state, such as database connection failures or critical configuration issues. When a fatal error occurs (and not handled by developer), the application will be shutdown immediately to prevent further issues.
* **Non-fatal errors** are less severe and can be handled gracefully, allowing the application to continue running.

You can define custom exceptions by extending the `Exception` class. Custom exceptions can be used to represent specific error conditions in your application.

```ts
import { Exception } from '@framework/core/vendors/exceptions';
import { FatalErrorException } from '@framework/core/app/exceptions';

// Basic Exception
export class SomethingWentWrongException extends Exception {
  public static code = 'SOMETHING_WENT_WRONG';
  public static status = 500;

  public constructor() {
    super('Hmm, something went wrong');
  }
}

// Fatal Exception
export class ConnectionErrorException extends FatalErrorException {
  public static code = 'CRITICAL_DATABASE_ERROR';
  public static status = 500;

  public constructor() {
    super('Critical database error occurred');
  }
}
```

```ts
// Get error handler
const errorHandler = await app.container.make('errorHandler')

// Only report errors
errorHandler.report(new Error('Something went wrong'));

// Handle errors globally
errorHandler.handle(new Error('Unhandled error'));

// Add fatal error cores
errorHandler.addFatalErrorCode('CRITICAL_DATABASE_ERROR');
```

#### Lifecycle Hooks
React to application lifecycle events:

```ts
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

### Kernel
The `Kernel` class manages the bootstrapping and lifecycle of the application, allowing you to define bootstrappers that run during the application startup.

```typescript
import { Kernel } from '@framework/core';

// ... application setup code ...

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

#### Bootstrappers
Control application initialization with bootstrappers. Basic bootstrappers can be found in `@framework/core/kernel/bootstrappers`. You can also create custom bootstrappers to handle specific initialization logic. 

Bootstrappers are classes that execute during the initialize phase of the application lifecycle, allowing you to set up global services, configurations, or any other necessary setup before the application starts.

```ts
import { Application } from '@framework/core/app';
import { BootstrapperInterface } from '@framework/core/kernel';

export default class CustomBootstrapper implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void> {
    // Add early bindings to the IoC container
    app.container.bindValue('customService', new CustomService());
  }
}
```

The framework predefines several bootstrappers to handle common tasks:

- **`@framework/core/bootstrappers/handle-errors`** - Sets up global error handling
- **`@framework/core/bootstrappers/load-environment-variables`** - Loads environment variables from `.env`
- **`@framework/core/bootstrappers/load-configuration`** - Loads configuration files
- **`@framework/core/bootstrappers/register-modules`** - Registers application modules
- **`@framework/core/bootstrappers/boot-modules`** - Boots all registered modules

# API Reference

```ts
declare class Application {
  get uid(): string;
  get isStarted(): boolean;
  get isBooted(): boolean;
  get modules(): {
    all: () => ModuleInterface[];
    register: (modules: ModuleResolver[]) => Promise<void>;
  };
  get state(): ApplicationState;
  get isShuttingDown(): boolean;
  get version(): string;
  get environment(): string;
  setUid(uid: string): void;
  onShutdown(handler: HookHandler<[Application], [Application]>): void;
  onBooting(handler: HookHandler<[Application], [Application]>): void;
  onBooted(handler: HookHandler<[Application], [Application]>): void;
  onStarting(handler: HookHandler<[Application], [Application]>): void;
  onStarted(handler: HookHandler<[Application], [Application]>): void;
  isEnvironment(environment: string): boolean;
  static setInstance(app: Application): void;
  static getInstance(): Application;
  setEnvionment(environment: string): void;
  register(modules: ModuleResolver[]): Promise<void>;
  boot(): Promise<void>;
  start(): Promise<void>;
  shutdown(): Promise<void>;
}

declare class Kernel {
  bootstrapWith(bootstrappers: BootstrapperResolver[]): Promise<this>;
  run(callback?: StartCallback): Promise<this>;
}
```
