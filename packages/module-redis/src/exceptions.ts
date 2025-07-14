import { InvalidArgumentsException } from '@framework/core/vendors/exceptions';

export class RedisClientConfigurationNotFoundException extends InvalidArgumentsException {
  public static readonly code = 'RedisClientConfigurationNotFound';
  public static readonly status = 500;

  constructor(
    public readonly client: string,
    cause?: unknown,
  ) {
    super(`Redis client configuration for "${client}" not found`, { cause });
  }
}
