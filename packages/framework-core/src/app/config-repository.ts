import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import { ConfigNotFoundException } from '#src/app/exceptions';
import type { ConfigBindings } from '#src/app/types';

export default class ConfigRepository
{
  protected readonly _config: Record<string, unknown> = {};

  public get<K extends keyof ConfigBindings | string = keyof ConfigBindings>(key: K): Result<K extends keyof ConfigBindings ? ConfigBindings[K] : unknown, ConfigNotFoundException> {
    if (! this.has(key)) {
      return err(new ConfigNotFoundException(key));
    }

    return ok(this._config[key] as K extends keyof ConfigBindings ? ConfigBindings[K] : unknown);
  }

  public set<K extends keyof ConfigBindings | string = keyof ConfigBindings>(key: K, value: K extends keyof ConfigBindings ? [K] : unknown): this {
    this._config[key] = value;
    return this;
  }

  public has<K extends keyof ConfigBindings | string = keyof ConfigBindings>(key: K): boolean {
    return Object.hasOwn(this._config, key);
  }

  public merge(config: Partial<ConfigBindings>): this {
    for (const [key, value] of Object.entries(config)) {
      this.set(key, value);
    }
    return this;
  }

  public all(): ConfigBindings {
    return this._config;
  }
}
