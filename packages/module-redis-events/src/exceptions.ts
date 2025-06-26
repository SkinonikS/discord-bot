import { Exception, InvalidArgumentsException } from '@poppinss/exception';

export class EventHandlerNotFoundException extends Exception {
  static status = 500;
  static code = 'E_REDIS_EVENT_HANDLER_NOT_FOUND';

  constructor(public readonly eventHandlerName: string, cause?: Error) {
    super(`Redis event handler '${eventHandlerName}' not found. Maybe you forgot to register it?`, { cause });
  }
}

export class InvalidEventHandlerArgumentsException extends InvalidArgumentsException {
  static status = 400;
  static code = 'E_INVALID_EVENT_HANDLER_ARGUMENTS';

  constructor(public readonly eventHandlerName: string, cause?: Error) {
    super(`Invalid arguments for redis action '${eventHandlerName}'.`, { cause });
  }
}

export class InvalidEventHandlerFormatException extends Error {
  static readonly statusCode = 400;
  static readonly code = 'E_INVALID_EVENT_HANDLER_FORMAT';
}
