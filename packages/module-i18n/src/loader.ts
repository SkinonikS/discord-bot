import { importModule } from '@framework/core/utils';
import type { BackendModule, ReadCallback } from 'i18next';
import type { SupportedLocales } from '#src/config/types';
import { LocaleNotDefinedException, TranslationsNotDefinedException } from '#src/exceptions';

export default class I18nLoader implements BackendModule {
  public readonly type = 'backend';

  public constructor(
    protected readonly _locales: Record<string, SupportedLocales>,
  ) { }

  public init(): void { }

  public read(language: string, namespace: string, callback: ReadCallback): void {
    const locale = this._locales[language];
    if (! locale) {
      callback(new LocaleNotDefinedException(language), null);
      return;
    }

    const namespaceResolver = locale.namespaces[namespace];
    if (! namespaceResolver) {
      callback(new TranslationsNotDefinedException(language, namespace), null);
      return;
    }

    importModule(() => namespaceResolver()).then((m) => callback(null, m));
  }
}
