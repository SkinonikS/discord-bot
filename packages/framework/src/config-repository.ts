import { getProperty, setProperty, hasProperty } from 'dot-prop';
import type { ConfigBindings, ConfigPathValue } from '#/types';

export default class ConfigRepository
{
  protected _config: ConfigBindings = {};

  constructor(config: ConfigBindings = {}) {
    this._config = config;
  }

  get<K extends keyof ConfigBindings | string = keyof ConfigBindings>(
    key: K extends keyof ConfigBindings ? K : string,
    defaultValue?: K extends keyof ConfigBindings ? ConfigPathValue<ConfigBindings, K> : unknown,
  ): ConfigPathValue<ConfigBindings, K> {
    return getProperty(this._config, key, defaultValue) as ConfigPathValue<ConfigBindings, K>;
  }

  set<K extends keyof ConfigBindings | string = keyof ConfigBindings>(
    key: K extends keyof ConfigBindings ? K : string,
    value: K extends keyof ConfigBindings ? ConfigPathValue<ConfigBindings, K> : unknown,
  ): void {
    setProperty(this._config, key, value);
  }

  has<K extends keyof ConfigBindings | string = keyof ConfigBindings>(
    key: K extends keyof ConfigBindings ? K : string,
  ): boolean {
    return hasProperty(this._config, key);
  }

  merge(config: Partial<ConfigBindings>): void {
    for (const [key, value] of Object.entries(config)) {
      this.set(key as keyof ConfigBindings, value as ConfigPathValue<ConfigBindings, keyof ConfigBindings>);
    }
  }

  all(): ConfigBindings {
    return this._config;
  }
}
