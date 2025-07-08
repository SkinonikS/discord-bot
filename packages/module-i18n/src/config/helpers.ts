import { defineBaseConfig } from '@framework/core/config';
import type { I18nConfig } from '#src/config/types';

export const defineI18nConfig = (config: Partial<I18nConfig>) => defineBaseConfig<I18nConfig>('i18n', {
  debug: config.debug ?? false,
  locale: config.locale ?? 'en',
  fallbackLocale: config.fallbackLocale ?? 'en',
  defaultNamespace: config.defaultNamespace ?? 'translations',
  preloadNamespaces: config.preloadNamespaces ?? [],
  supportedLocales: config.supportedLocales ?? {},
});
