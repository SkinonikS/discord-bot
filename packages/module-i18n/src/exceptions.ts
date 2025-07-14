import { RuntimeException } from '@framework/core/vendors/exceptions';

export class TranslationsNotDefinedException extends RuntimeException {
  public static readonly code = 'translations_not_defined';
  public static readonly status = 500;

  public constructor(
    public readonly locale: string,
    public readonly namespace: string,
    cause?: unknown,
  ) {
    super(`Translations for locale "${locale}" and namespace "${namespace}" is not defined. Maybe you forgot to add it to the configuration?`, { cause });
  }
}

export class LocaleNotDefinedException extends RuntimeException {
  public static readonly code = 'locale_not_defined';
  public static readonly status = 500;

  public constructor(
    public readonly locale: string,
    cause?: unknown,
  ) {
    super(`Translations for locale "${locale}" is not defined. Maybe you forgot to add it to the configuration?`, { cause });
  }
}
