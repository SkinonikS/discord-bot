# Redis Module
A Redis module for the which provides connection management, multiple client support, and type-safe configuration.

## Configuration
You can configure Redis clients in your application using the `defineRedisConfig` function.

```ts
import { defineRedisConfig } from '@module/redis/config';

export default defineRedisConfig({
  default: 'main',
  clients: {
    main: {
      secure: false,
      host: 'localhost',
      port: 6379,
      database: 0,
    },
  },
});
```

### Advanced Configuration
You can define multiple Redis clients with different configurations, such as secure connections, authentication, and database selection. Here's an example of a more complex configuration:

```ts
import { defineRedisConfig } from '@module/redis/config';

export default defineRedisConfig({
  default: 'primary',
  clients: {
    primary: {
      secure: true,
      host: 'redis.example.com',
      port: 6380,
      database: 0,
      username: 'redis-user',
      password: process.env.REDIS_PASSWORD,
    },
    cache: {
      secure: false,
      host: 'localhost',
      port: 6379,
      database: 1,
    },
    sessions: {
      secure: false,
      host: 'localhost',
      port: 6379,
      database: 2,
    },
  },
});
```

## Resolving Redis Clients
You can resolve Redis clients in your classes using dependency injection.

### Resolve Default Client
You can inject the default Redis client directly into your classes:

```ts
import type { RedisClientType } from '@module/redis/vendors/redis';

export default class MyService {
  public static containerInjections = {
    _constructor: {
      dependencies: ['redis.client'],
    },
  };

  public constructor(
    protected readonly _redis: RedisClientType,
  ) { }

  public async foo(): Promise<void> {
    await this._redis.set('key', 'value');
  }
}
```

### Resolve Client from Manager
Or if you need to manage multiple clients, you can use the `Manager` to resolve specific clients:

```ts
import { Manager } from '@module/redis';

export default class MyService {
  public static containerInjections = {
    _constructor: {
      dependencies: ['redis'],
    },
  };

  public constructor(
    protected readonly _redis: Manager,
  ) { }

  public async foo(): Promise<void> {
    const client = this._redis.client('cache');
    // Alternatively, you can use (they do the same):
    // const client = this._redis.redis('cache');
    // const client = this._redis.get('cache');
    await client.set('key', 'value');

    const sessions = this._redis.client('sessions');
    await sessions.set('session:1234', 'foo-bar');
  }
}
```

## Helper Functions
You can also use helper functions to get the default Redis client or a specific client from the manager without needing to inject them into your classes:

```ts
import { getDefaultRedisClient, getRedisManager } from '@module/redis';

// Get default Redis client directly
// Same as resolving 'redis.client'
const redis = await getDefaultRedisClient();
await redis.set('user:123', JSON.stringify({ name: 'John' }));

// Get specific client via manager
// Same as resolving 'redis'
const manager = await getRedisManager();
const cacheClient = manager.client('cache');
await cacheClient.hSet('cache:stats', 'users', '1000');
```

## API Reference

```ts
interface RedisConfig {
  default: string;
  clients: Record<string, RedisClientConfig>;
}

interface RedisClientConfig {
  secure: boolean;
  host: string;
  port: number;
  database: number;
  username?: string;
  password?: string;
}

class Manager {
  client(name?: string): RedisClientType;
  redis(name?: string): RedisClientType;
  get(name?: string): RedisClientType;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

declare const getRedisManager: (app?: Application) => Promise<Manager>;
declare const getDefaultRedisClient: (app?: Application) => Promise<RedisClientType>;
```

### Container Bindings
The module registers the following container bindings:

```ts
declare module '@framework/core/app' {
  interface ContainerBindings {
    'redis': Manager;
    'redis.client': RedisClientType;
  }

  interface ConfigBindings {
    'redis': RedisConfig;
  }
}
```
