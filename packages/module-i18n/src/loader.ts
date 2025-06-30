import { importModule } from '@framework/core/utils';
import type { BackendModule, ReadCallback } from 'i18next';
import type { TranslationResolverMap } from './config/types';

export default class I18nLoader implements BackendModule {
  public readonly type = 'backend';

  public constructor(
    protected readonly _translations: TranslationResolverMap,
  ) { }

  public init(): void { }

  public read(language: string, namespace: string, callback: ReadCallback): void {
    const namespaceeMap = this._translations[language];
    if (! namespaceeMap) {
      callback(new Error(`No translations found for language: ${language}`), null);
      return;
    }

    const translationResolver = namespaceeMap[namespace];
    if (! translationResolver) {
      callback(new Error(`No translation resolver found for namespace: ${namespace} in language: ${language}`), null);
      return;
    }

    importModule(() => translationResolver()).then((m) => callback(null, m));
  }
}
