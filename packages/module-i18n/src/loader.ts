import { importModule } from '@framework/core/utils';
import type { BackendModule, ReadCallback } from 'i18next';
import type { SupportedLocales } from '#src/config/types';

export default class I18nLoader implements BackendModule {
  public readonly type = 'backend';

  public constructor(
    protected readonly _locales: Record<string, SupportedLocales>,
  ) { }

  public init(): void { }

  public read(language: string, namespace: string, callback: ReadCallback): void {
    const locale = this._locales[language];
    if (! locale) {
      callback(new Error(`No translations found for language: ${language}`), null);
      return;
    }

    const translationResolver = locale.namespaces[namespace];
    if (! translationResolver) {
      callback(new Error(`No translation resolver found for namespace: ${namespace} in language: ${language}`), null);
      return;
    }

    importModule(() => translationResolver()).then((m) => callback(null, m));
  }
}
