import type { ModuleInterface, Application, ConfigRepository } from '@framework/core/app';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { createInstance } from 'i18next';
import type { i18n } from 'i18next';
import pkg from '#root/package.json';
import type { I18nConfig } from '#src/config/types';
import I18nLoader from '#src/loader';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'i18n': i18n;
    'i18n.logger': LoggerInterface;
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
      const logger: LoggerInterface = await container.make('i18n.logger');
      const config: ConfigRepository = await container.make('config');
      const i18nConfig = config.get('i18n');
      if (i18nConfig.isErr()) {
        throw i18nConfig.error;
      }

      const i18nInstance = createInstance();

      i18nInstance.use(new I18nLoader(i18nConfig.value.translations, logger));
      i18nInstance.on('failedLoading', (lng, ns, msg) => logger.error(msg));

      await i18nInstance.init({
        partialBundledLanguages: true,
        lng: i18nConfig.value.locale,
        fallbackLng: i18nConfig.value.fallbackLocale,
        debug: i18nConfig.value.debug,
        ns: [],
        resources: {},
      });

      return i18nInstance;
    });

    app.container.singleton('i18n.logger', async (container) => {
      const loggerFactory: LoggerFactoryInterface = await container.make('logger.factory');
      return loggerFactory.createLogger(this.id);
    });
  }
}
