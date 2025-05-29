import { getProperty, setProperty, hasProperty } from 'dot-prop';

export class ConfigRepository<K extends string = string>
{
  protected config: Record<K, unknown> = {} as Record<K, unknown>;

  constructor(config: Record<K, unknown> = {} as Record<K, unknown>)
  {
    this.config = config;
  }

  get<T = unknown>(key: K, defaultValue?: T): T
  {
    return getProperty<typeof this.config, K, T>(this.config, key, defaultValue ?? undefined) as T;
  }

  set(key: K, value: unknown): void
  {
    setProperty(this.config, key, value);
  }

  has(key: K): boolean
  {
    return hasProperty(this.config, key);
  }

  merge(config: Record<K, unknown>): void
  {
    for (const [key, value] of Object.entries(config)) {
      this.set(key as K, value);
    }
  }

  all(): Record<K, unknown>
  {
    return this.config;
  }
}
