export type TranslationString = string | { [key: string]: TranslationString };
export type TranslationNamespaceResolver = () => Promise<{ default: Record<string, TranslationString> }>;

export interface SupportedLocales {
  name: string;
  namespaces: Record<string, TranslationNamespaceResolver>;
}

export interface I18nConfig {
  debug: boolean;
  locale: string;
  fallbackLocale: string;
  defaultNamespace?: string;
  preloadNamespaces: string[];
  supportedLocales: Record<string, SupportedLocales>;
}
