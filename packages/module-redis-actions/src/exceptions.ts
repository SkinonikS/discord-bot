import { Exception, InvalidArgumentsException } from '@poppinss/exception';

export class RedisActionNotFoundException extends Exception {
  static status = 500;
  static code = 'E_REDIS_ACTION_NOT_FOUND';

  constructor(public readonly actionName: string, cause?: Error) {
    super(`Redis action '${actionName}' not found. Maybe you forgot to register it?`, { cause });
  }
}

export class InvalidRedisActionArgumentsError extends InvalidArgumentsException {
  static status = 400;
  static code = 'E_INVALID_REDIS_ACTION_ARGUMENTS';

  constructor(public readonly actionName: string, cause?: Error) {
    super(`Invalid arguments for redis action '${actionName}'.`, { cause });
  }
}
