import type { i18n } from '@module/i18n/vendors/i18next';

export interface GenerateLocalizationsResult {
  nameLocalizations: Record<string, string>;
  descriptionLocalizations: Record<string, string>;
  options: Record<string, Omit<GenerateLocalizationsResult, 'options' | 'subcommands'>>;
  subcommands: Record<string, Omit<GenerateLocalizationsResult, 'subcommands'>>;
}

export interface TranslationObject {
  name?: string;
  description?: string;
  options?: Record<string, {
    name?: string;
    description?: string;
  }>;
  subcommands?: Record<string, {
    name?: string;
    description?: string;
    options?: Record<string, {
      name?: string;
      description?: string;
    }>;
  }>;
}

export interface LocalizationConfig {
  options?: string[];
  subcommands?: string[] | Record<string, {
    options?: string[];
  }>;
}

export interface KeyResolvers {
  commandName: (commandName: string) => string;
  commandDescription: (commandName: string) => string;
  optionName: (commandName: string, optionName: string) => string;
  optionDescription: (commandName: string, optionName: string) => string;
  subcommandName: (commandName: string, subcommandName: string) => string;
  subcommandDescription: (commandName: string, subcommandName: string) => string;
  subcommandOptionName: (commandName: string, subcommandName: string, optionName: string) => string;
  subcommandOptionDescription: (commandName: string, subcommandName: string, optionName: string) => string;
}

export default class LocalizationGenerator {
  public constructor(
    protected readonly _i18n: i18n,
    protected readonly _i18nKeyResolvers: KeyResolvers,
  ) { }

  public generate(commandName: string, config: LocalizationConfig = {}): GenerateLocalizationsResult {
    const supportedLngs = this._i18n.options.supportedLngs || [];
    const availableLocales =  supportedLngs.filter(lng => lng !== 'cimode');

    const metadata: GenerateLocalizationsResult = {
      nameLocalizations: {},
      descriptionLocalizations: {},
      options: {},
      subcommands: {},
    };

    for (const locale of availableLocales) {
      metadata.nameLocalizations[locale] = this._i18n.t(this._i18nKeyResolvers.commandName(commandName), { lng: locale });
      metadata.descriptionLocalizations[locale] = this._i18n.t(this._i18nKeyResolvers.commandDescription(commandName), { lng: locale });
      metadata.options = this._generateOptionsLocalization(commandName, config.options ?? [], locale);
      metadata.subcommands = this._generateSubcommandsLocalization(commandName, config.subcommands ?? [], locale);
    }

    return metadata;
  }

  protected _processSubcommand(commandName: string, subcommandName: string, subcommandConfig: { options?: string[] }, locale: string): Omit<GenerateLocalizationsResult, 'subcommands'> {
    const translatedObject: Omit<GenerateLocalizationsResult, 'subcommands'> = {
      descriptionLocalizations: {},
      nameLocalizations: {},
      options: {},
    };

    translatedObject.nameLocalizations[locale] = this._i18n.t(this._i18nKeyResolvers.subcommandName(commandName, subcommandName), { lng: locale });
    translatedObject.descriptionLocalizations[locale] = this._i18n.t(this._i18nKeyResolvers.subcommandDescription(commandName, subcommandName), { lng: locale });
    translatedObject.options = this._generateSubcommandOptionsLocalization(commandName, subcommandName, subcommandConfig.options ?? [], locale);

    return translatedObject;
  }

  protected _generateSubcommandsLocalization(commandName: string, subcommands: string[] | Record<string, { options?: string[] }>, locale: string): Record<string, Omit<GenerateLocalizationsResult, | 'subcommands'>> {
    const translatedObject: Record<string, Omit<GenerateLocalizationsResult, 'subcommands'>> = {};

    if (Array.isArray(subcommands)) {
      for (const subcommandName of subcommands) {
        translatedObject[subcommandName] = this._processSubcommand(commandName, subcommandName, {}, locale);
      }

      return translatedObject;
    }

    for (const [subcommandName, subcommandConfig] of Object.entries(subcommands)) {
      translatedObject[subcommandName] = this._processSubcommand(commandName, subcommandName, subcommandConfig, locale);
    }

    return translatedObject;
  }

  protected _generateOptionsLocalization(commandName: string, options: string[], locale: string): Record<string, Omit<GenerateLocalizationsResult, 'options' | 'subcommands'>> {
    const translatedOptions: Record<string, Omit<GenerateLocalizationsResult, 'options' | 'subcommands'>> = {};

    for (const option of options) {
      if (! translatedOptions[option]) {
        translatedOptions[option] = {
          descriptionLocalizations: {},
          nameLocalizations: {},
        };
      }

      translatedOptions[option].nameLocalizations[locale] = this._i18n.t(this._i18nKeyResolvers.optionName(commandName, option), { lng: locale });
      translatedOptions[option].descriptionLocalizations[locale] = this._i18n.t(this._i18nKeyResolvers.optionDescription(commandName, option), { lng: locale });
    }

    return translatedOptions;
  }

  protected _generateSubcommandOptionsLocalization(commandName: string, subcommandName: string, options: string[], locale: string): Record<string, Omit<GenerateLocalizationsResult, 'options' | 'subcommands'>> {
    const translatedOptions: Record<string, Omit<GenerateLocalizationsResult, 'options' | 'subcommands'>> = {};

    for (const option of options) {
      if (! translatedOptions[option]) {
        translatedOptions[option] = {
          descriptionLocalizations: {},
          nameLocalizations: {},
        };
      }

      translatedOptions[option].nameLocalizations[locale] = this._i18n.t(this._i18nKeyResolvers.subcommandOptionName(commandName, subcommandName, option), { lng: locale });
      translatedOptions[option].descriptionLocalizations[locale] = this._i18n.t(this._i18nKeyResolvers.subcommandOptionDescription(commandName, subcommandName, option), { lng: locale });
    }

    return translatedOptions;
  }
}
