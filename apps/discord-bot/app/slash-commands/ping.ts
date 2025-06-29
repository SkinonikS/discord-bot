import { ok } from '@framework/core/vendors/neverthrow';
import type { Result } from '@framework/core/vendors/neverthrow';
import type { ChatInputCommandInteraction } from '@module/discord/vendors/discordjs';
import { SlashCommandBuilder, MessageFlags } from '@module/discord/vendors/discordjs';
import type { i18n } from '@module/i18n/vendors/i18next';
import type { SlashCommandInterface } from '@module/slash-commands';

export default class PingCommand implements SlashCommandInterface {
  static containerInjections = {
    _constructor: {
      dependencies: ['i18n'],
    },
  };

  public constructor(
    protected readonly _i18n: i18n,
  ) { }

  public readonly name = 'ping';

  public get metadata(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Replies with Pong!');
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<Result<void, Error>> {
    await this._i18n.loadLanguages(interaction.locale);
    await this._i18n.loadNamespaces('slash-commands');

    await interaction.reply({
      content: this._i18n.t('slash-commands:ping', { lng: interaction.locale }),
      flags: MessageFlags.Ephemeral,
    });

    return ok();
  }
}
