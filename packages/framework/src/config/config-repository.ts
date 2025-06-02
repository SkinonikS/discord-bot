import { getProperty, setProperty, hasProperty } from 'dot-prop';
import type { ConfigBindings } from '#/types';

export type ConfigPathValue<T, P extends string> =
  P extends keyof T ? T[P] :
    P extends `${infer K}.${infer R}` ?
      K extends keyof T ?
        ConfigPathValue<T[K] extends Record<string, unknown> ? T[K] : object, R> :
        unknown :
      unknown;

export class ConfigRepository
{
  protected config: ConfigBindings = {};

  constructor(config: ConfigBindings = {})
  {
    this.config = config;
  }

  get<K extends keyof ConfigBindings | string = keyof ConfigBindings>(
    key: K extends keyof ConfigBindings ? K : string,
    defaultValue?: K extends keyof ConfigBindings ? ConfigPathValue<ConfigBindings, K> : unknown,
  ): ConfigPathValue<ConfigBindings, K>
  {
    return getProperty(this.config, key, defaultValue) as ConfigPathValue<ConfigBindings, K>;
  }

  set<K extends keyof ConfigBindings | string = keyof ConfigBindings>(
    key: K extends keyof ConfigBindings ? K : string,
    value: K extends keyof ConfigBindings ? ConfigPathValue<ConfigBindings, K> : unknown,
  ): void
  {
    setProperty(this.config, key, value);
  }

  has<K extends keyof ConfigBindings | string = keyof ConfigBindings>(
    key: K extends keyof ConfigBindings ? K : string,
  ): boolean
  {
    return hasProperty(this.config, key);
  }

  merge(config: Partial<ConfigBindings>): void
  {
    for (const [key, value] of Object.entries(config)) {
      this.set(key as keyof ConfigBindings, value);
    }
  }

  all(): ConfigBindings
  {
    return this.config;
  }
}
