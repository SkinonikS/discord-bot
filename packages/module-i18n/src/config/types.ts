
export type TranslationString = string | { [key: string]: TranslationString };
export type TranslationResolver = () => Promise<{ default: Record<string, TranslationString> }>;

// locale => namespace => resolver
// eg: { 'en-US': { 'slash-commands': () => import('./locales/en-US/slash-commands.ts') } }
export type TranslationResolverMap = Record<string, Record<string, TranslationResolver>>;

export interface I18nConfig {
  locale: string;
  fallbackLocale: string;
  debug: boolean;
  translations: TranslationResolverMap;
}
