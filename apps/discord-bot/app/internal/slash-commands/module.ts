import type { Application, ModuleInterface } from '@framework/core/app';
import LocalizationGenerator from './localization-generator';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'slash-commands.localization-generator': LocalizationGenerator;
  }
}

export default class InternalSlashCommandModule implements ModuleInterface {
  public readonly id: string = '@app/internal/slash-commands';
  public readonly author: string = 'Vadim SkinonikS.#';
  public readonly version: string = 'latest';

  public register(app: Application): void {
    app.container.singleton('slash-commands.localization-generator', async (container) => {
      return new LocalizationGenerator(await container.make('i18n'), {
        commandName: (commandName: string) => `slashCommands.${commandName}.metadata.name`,
        commandDescription: (commandName: string) => `slashCommands.${commandName}.metadata.description`,
        optionName: (commandName: string, optionName: string) => `slashCommands.${commandName}.metadata.options.${optionName}.name`,
        optionDescription: (commandName: string, optionName: string) => `slashCommands.${commandName}.metadata.options.${optionName}.description`,
        subcommandName: (commandName: string, subcommandName: string) => `slashCommands.${commandName}.metadata.subcommands.${subcommandName}.name`,
        subcommandDescription: (commandName: string, subcommandName: string) => `slashCommands.${commandName}.metadata.subcommands.${subcommandName}.description`,
        subcommandOptionName: (commandName: string, subcommandName: string, optionName: string) => `slashCommands.${commandName}.metadata.subcommands.${subcommandName}.options.${optionName}.name`,
        subcommandOptionDescription: (commandName: string, subcommandName: string, optionName: string) => `slashCommands.${commandName}.metadata.subcommands.${subcommandName}.options.${optionName}.description`,
      });
    });
  }
}
