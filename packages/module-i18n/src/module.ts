import type { ModuleInterface, Application, ConfigRepository } from '@framework/core/app';
import type { LoggerInterface } from '@module/logger';
import { createInstance } from 'i18next';
import type { i18n } from 'i18next';
import pkg from '#root/package.json';
import type { I18nConfig } from '#src/config/types';
import I18nLoader from '#src/loader';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'i18n': i18n;
  }

  interface ConfigBindings {
    'i18n': I18nConfig;
  }
}

export default class I18nModule implements ModuleInterface {
  public readonly id = pkg.name;
  public readonly author = pkg.author;
  public readonly version = pkg.version;

  public register(app: Application): void {
    app.container.singleton('i18n', async (container) => {
      const logger: LoggerInterface = await container.make('logger');
      const config: ConfigRepository = await container.make('config');
      const i18nConfig = config.get('i18n');

      const supportedLocales = Object.keys(i18nConfig.supportedLocales);
      const i18nInstance = createInstance();

      i18nInstance.use(new I18nLoader(i18nConfig.supportedLocales));
      i18nInstance.on('languageChanged', (lng) => logger.debug(`Language changed to: ${lng}`));
      i18nInstance.on('initialized', () => logger.debug(`i18n initialized with locale: ${i18nConfig.locale}, fallbackLocale: ${i18nConfig.fallbackLocale}`));
      i18nInstance.on('failedLoading', (lng, ns, msg) => logger.error(msg));
      i18nInstance.on('loaded', (loaded) => logger.debug(`Translations loaded: ${JSON.stringify(loaded)}`));
      i18nInstance.on('added', (lng, ns) => logger.debug(`Translations added for language: ${lng}, namespace: ${ns}`));
      i18nInstance.on('removed', (lng, ns) => logger.debug(`Translations removed for language: ${lng}, namespace: ${ns}`));

      await i18nInstance.init({
        partialBundledLanguages: true,
        lng: i18nConfig.locale,
        fallbackLng: i18nConfig.fallbackLocale,
        supportedLngs: supportedLocales,
        debug: i18nConfig.debug,
        preload: supportedLocales,
        defaultNS: i18nConfig.defaultNamespace,
        ns: i18nConfig.preloadNamespaces,
        resources: {},
      });

      return i18nInstance;
    });
  }
}
