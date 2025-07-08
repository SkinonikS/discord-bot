import { defineI18nConfig } from '@module/i18n/config';
import { Env } from '#bootstrap/env';

export default defineI18nConfig({
  locale: Env.I18N_LOCALE,
  fallbackLocale: Env.I18N_FALLBACK_LOCALE,
  debug: Env.I18N_DEBUG,
  preloadNamespaces: ['translation'],
  defaultNamespace: 'translation',
  // https://discord.com/developers/docs/reference#locales
  supportedLocales: {
    'en-US': {
      name: 'English (US)',
      namespaces: {
        translation: () => import('#locales/en-US/translation'),
      },
    },
    ru: {
      name: 'Русский',
      namespaces: {
        translation: () => import('#locales/ru/translation'),
      },
    },
  },
});
