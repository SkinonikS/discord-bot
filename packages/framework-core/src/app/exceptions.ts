import { Exception } from '@poppinss/exception';

export class FatalErrorException extends Exception {
  //
}

export class ConfigNotFoundException extends FatalErrorException {
  public static readonly code = 'ConfigNotFound';
  public static readonly status = 500;

  public constructor(public readonly configName: string, cause?: unknown) {
    super(`Configuration for '${configName}' is missing.`, { cause });
    this.help = 'Maybe you forgot to add it into \'bootstrap/kernel.ts\'?';
  }
}

export class InvalidAppStateTransitionException extends FatalErrorException {
  public static readonly code = 'InvalidAppStateTransition';
  public static readonly status = 500;

  public constructor(
    public readonly currentState: string,
    public readonly targetState: string,
    cause?: unknown,
  ) {
    super(`Invalid state transition from '${currentState}' to '${targetState}'.`, { cause });
  }
}
