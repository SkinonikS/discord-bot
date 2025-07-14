import { FatalErrorException } from '#src/app';

export class ImportNotFoundException extends FatalErrorException {
  public static readonly code = 'ImportNotFound';
  public static readonly status = 500;

  public constructor(
    public readonly importModuleName: string,
    cause?: unknown,
  ) {
    super(`Module '${importModuleName}' could not be imported.`, { cause });
    this.help = 'Maybe it is missing or the path is incorrect?';
  }
}
