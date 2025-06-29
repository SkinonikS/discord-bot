import { defineBaseConfig } from '@framework/core/config';
import type { I18nConfig } from './types';

export const defineI18nConfig = (config: Partial<I18nConfig>) => defineBaseConfig<I18nConfig>('i18n', {
  debug: config.debug ?? false,
  locale: config.locale ?? 'en',
  fallbackLocale: config.fallbackLocale ?? 'en',
  translations: config.translations ?? {},
});
