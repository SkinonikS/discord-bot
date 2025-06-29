import { defineI18nConfig } from '@module/i18n/config';
import { Env } from '#bootstrap/env';

export default defineI18nConfig({
  locale: Env.I18N_LOCALE,
  fallbackLocale: Env.I18N_FALLBACK_LOCALE,
  debug: Env.I18N_DEBUG,
  translations: {
    en: {
      'slash-commands': () => import('#locales/en/slash-commands'),
    },
    ru: {
      'slash-commands': () => import('#locales/ru/slash-commands'),
    },
  },
});
