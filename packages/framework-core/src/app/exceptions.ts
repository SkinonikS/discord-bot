import { Exception, RuntimeException } from '@poppinss/exception';

export abstract class FatalErrorException extends Exception {
  //
}

export class ConfigNotFoundException extends RuntimeException {
  public static status = 500;
  public static code = 'E_CONFIG_NOT_FOUND';

  public constructor(public readonly configName: string, cause?: unknown) {
    super(`Configuration for '${configName}' is missing. Maybe you forgot to add it into 'bootstrap/kernel.ts'?`, { cause });
  }
}

export class InvalidStateTransitionException extends RuntimeException {
  public static status = 500;
  public static code = 'E_INVALID_STATE_TRANSITION';

  public constructor(public readonly currentState: string, public readonly targetState: string, cause?: unknown) {
    super(`Invalid state transition from '${currentState}' to '${targetState}'.`, { cause });
  }
}
