import type { LoggerInterface } from '@module/logger';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import type { RedisClientConfig, RedisConfig } from '#src/config/types';
import { RedisClientConfigurationNotFoundException } from '#src/exceptions';

export default class Manager {
  protected readonly _resolved = new Map<string, RedisClientType>();

  public constructor(
    protected readonly _config: RedisConfig,
    protected readonly _logger: LoggerInterface,
  ) { }

  public get(name?: string): RedisClientType {
    return this.redis(name);
  }

  public client(name?: string): RedisClientType {
    return this.redis(name);
  }

  public redis(name?: string): RedisClientType {
    name ??= this._getDefaultClientName();

    if (this._resolved.has(name)) {
      this._logger.debug(`Using cached Redis client '${name}'`);
      return this._resolved.get(name) as RedisClientType;
    }

    this._logger.debug(`Resolving new Redis client '${name}'`);
    const resolved = this._resolve(name);
    this._resolved.set(name, resolved);
    return resolved;
  }

  public async disconnect(): Promise<void> {
    for (const [name, client] of this._resolved.entries()) {
      await client.disconnect();
      this._logger.debug(`Redis client "${name}" disconnected`);
    }
  }

  public async connect(): Promise<void> {
    for (const clientName of Object.keys(this._config.clients)) {
      const client = this.redis(clientName);

      if (! client.isOpen) {
        await client.connect();
        this._logger.debug(`Redis client '${clientName}' connected`);
      }
    }
  }

  protected _resolve(name: string): RedisClientType {
    const configResult = this._getClientConfig(name);
    return this._createRedisClient(configResult);
  }

  protected _createRedisClient(config: RedisClientConfig): RedisClientType {
    this._logger.debug({ ...config, password: '****' }, `Creating Redis client for ${config.host}:${config.port}.`);

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

  protected _getClientConfig(name: string): RedisClientConfig {
    const config = this._config.clients[name];

    if (! config) {
      throw new RedisClientConfigurationNotFoundException(name);
    }

    return config;
  }

  protected _getDefaultClientName(): string {
    return this._config.default;
  }
}
