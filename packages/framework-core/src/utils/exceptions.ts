import { RuntimeException } from '@poppinss/exception';

export class ImportNotFoundException extends RuntimeException {
  public static status = 500;
  public static code = 'E_IMPORT_NOT_FOUND';

  public constructor(public readonly moduleName: string, cause?: Error) {
    super(`Module '${moduleName}' could not be imported. Maybe it is missing or the path is incorrect?`, { cause });
  }
}
