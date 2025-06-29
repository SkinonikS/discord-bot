import { importModule } from '@framework/core/utils';
import type { LoggerInterface } from '@module/logger';
import type { BackendModule, ReadCallback } from 'i18next';
import type { TranslationResolverMap } from './config/types';

export default class I18nLoader implements BackendModule {
  public readonly type = 'backend';

  public constructor(
    protected readonly _translations: TranslationResolverMap,
    protected readonly _logger: LoggerInterface,
  ) { }

  public init(): void { }

  public read(language: string, namespace: string, callback: ReadCallback): void {
    const namespaceeMap = this._translations[language];
    if (! namespaceeMap) {
      this._logger.debug(`No translations found for language: ${language}`);
      callback(new Error(`No translations found for language: ${language}`), null);
      return;
    }

    const translationResolver = namespaceeMap[namespace];
    if (! translationResolver) {
      this._logger.debug(`No translations found for language: ${language}`);
      callback(new Error(`No translation resolver found for namespace: ${namespace} in language: ${language}`), null);
      return;
    }

    importModule(() => translationResolver()).then((m) => {
      this._logger.debug(`Translations loaded for language: ${language}, namespace: ${namespace}`);
      callback(null, m);
    });
  }
}
