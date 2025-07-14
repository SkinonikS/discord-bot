import { tap } from '@framework/core/utils';
import type { ChatInputCommandInteraction } from '@module/discord/vendors/discordjs';
import { SlashCommandBuilder, MessageFlags, DiscordjsError } from '@module/discord/vendors/discordjs';
import type { i18n } from '@module/i18n/vendors/i18next';
import type { SlashCommandInterface } from '@module/slash-commands';
import type LocalizationGenerator from '#app/internal/slash-commands/localization-generator';

export default class PingCommand implements SlashCommandInterface {
  public static containerInjections = {
    _constructor: {
      dependencies: ['i18n', 'slash-commands.localization-generator'],
    },
  };

  public constructor(
    protected readonly _i18n: i18n,
    protected readonly _localizationGenerator: LocalizationGenerator,
  ) { }

  public readonly name = 'ping';

  public get metadata(): SlashCommandBuilder {
    return tap(new SlashCommandBuilder(), (builder) => {
      const metadata = this._localizationGenerator.generate(this.name);

      return builder
        .setName(this.name)
        .setDescription('Replies with Pong!')
        .setNameLocalizations(metadata.nameLocalizations)
        .setDescriptionLocalizations(metadata.descriptionLocalizations);
    });
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      const message = this._i18n.t('slashCommands.ping.responses.pinging', { lng: interaction.locale });
      const replyResult = await interaction.reply({
        content: message,
        flags: MessageFlags.Ephemeral,
        withResponse: true,
      });

      const latency = (replyResult.resource?.message?.createdTimestamp ?? 0) - replyResult.interaction.createdTimestamp;
      const message2 = this._i18n.t('slashCommands.ping.responses.pingMs', { lng: interaction.locale, latency });
      await interaction.editReply({
        content: message2,
      });
    } catch (e) {
      if (e instanceof DiscordjsError) {
        return;
      }

      throw e;
    }
  }
}
