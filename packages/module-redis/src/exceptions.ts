import { FatalErrorException } from '@framework/core/app';
import { InvalidArgumentsException } from '@framework/core/vendors/exceptions';

export class RedisConnectionException extends FatalErrorException {
  static code = 'E_REDIS_CONNECTION';
  static status = 500;

  constructor(client: string, cause?: unknown) {
    super(`Failed to connect to Redis client "${client}"`, { cause });
  }
}

export class RedisClientConfigurationNotFoundException extends InvalidArgumentsException {
  static code = 'E_REDIS_CLIENT_CONFIG_NOT_FOUND';
  static status = 500;

  constructor(client: string, cause?: unknown) {
    super(`Redis client configuration for "${client}" not found`, { cause });
  }
}
