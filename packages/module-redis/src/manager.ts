import type { Result } from '@framework/core/vendors/neverthrow';
import { ok, err, fromPromise, fromSafePromise } from '@framework/core/vendors/neverthrow';
import { createClient, type RedisClientType } from 'redis';
import type { RedisClientConfig, RedisConfig } from '#src/config/types';
import { RedisClientConfigurationNotFoundException, RedisConnectionException } from '#src/exceptions';

export default class Manager {
  protected readonly _resolved = new Map<string, RedisClientType>();

  public constructor(
    protected readonly config: RedisConfig,
  ) { }

  public get(name?: string): Result<RedisClientType, Error> {
    return this.redis(name);
  }

  public client(name?: string): Result<RedisClientType, Error> {
    return this.redis(name);
  }

  public redis(name?: string): Result<RedisClientType, Error> {
    name ??= this._getDefaultClientName();

    if (this._resolved.has(name)) {
      return ok(this._resolved.get(name) as RedisClientType);
    }

    const resolved = this._resolve(name);
    if (resolved.isErr()) {
      return err(resolved.error);
    }

    this._resolved.set(name, resolved.value);
    return ok(resolved.value);
  }

  public async disconnect(): Promise<void> {
    for (const client of this._resolved.values()) {
      if (client.isOpen) {
        await fromSafePromise(client.disconnect());
      }
    }
  }

  public async connect(): Promise<Result<void, Error>> {
    for (const [name, client] of this._resolved.entries()) {
      if (! client.isOpen) {
        const connectResult = await fromPromise(client.connect(), (e) => {
          return new RedisConnectionException(name, e);
        });

        if (connectResult.isErr()) {
          return err(connectResult.error);
        }
      }
    }

    return ok();
  }

  protected _resolve(name: string): Result<RedisClientType, Error> {
    const configResult = this._getClientConfig(name);
    if (configResult.isErr()) {
      return err(configResult.error);
    }

    return ok(this._createRedisClient(configResult.value));
  }

  protected _createRedisClient(config: RedisClientConfig): RedisClientType {
    return createClient({
      url: `${config.secure ? 'rediss' : 'redis'}://${config.host}:${config.port}`,
      database: config.database,
      username: config.username ?? undefined,
      password: config.password ?? undefined,
      socket: {
        reconnectStrategy: false,
      },
    });
  }

  protected _getClientConfig(name: string): Result<RedisClientConfig, Error> {
    const config = this.config.clients[name];

    if (! config) {
      return err(new RedisClientConfigurationNotFoundException(name));
    }

    return ok(config);
  }

  protected _getDefaultClientName(): string {
    return this.config.default;
  }
}
