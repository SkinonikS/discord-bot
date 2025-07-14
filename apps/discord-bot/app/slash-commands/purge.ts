import { tap } from '@framework/core/utils';
import { Exception } from '@framework/core/vendors/exceptions';
import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from '@module/discord/vendors/discordjs';
import type { ChatInputCommandInteraction } from '@module/discord/vendors/discordjs';
import type { i18n } from '@module/i18n/vendors/i18next';
import type { SlashCommandInterface } from '@module/slash-commands';
import type LocalizationGenerator from '#app/internal/slash-commands/localization-generator';

export class BuilkMessagesFetchException extends Exception {
  public static readonly status = 500;
  public static readonly code = 'E_BULK_EDIT_ERROR';

  public constructor(
    public readonly commandName: string,
    cause?: unknown,
  ) {
    super(`Failed to fetch messages using command ${commandName}`, { cause });
  }
}

export default class PurgeSlashCommand implements SlashCommandInterface {
  public static containerInjections = {
    _constructor: {
      dependencies: ['i18n', 'slash-commands.localization-generator'],
    },
  };

  public readonly name = 'purge';

  public constructor(
    protected readonly _i18n: i18n,
    protected readonly _localizationGenerator: LocalizationGenerator,
  ) { }

  public get metadata(): SlashCommandBuilder {
    return tap(new SlashCommandBuilder(), (builder) => {
      const metadata = this._localizationGenerator.generate(this.name, {
        options: ['amount'],
      });

      return builder
        .setName(this.name)
        .setDescription('Delete a number of messages from the channel')
        .setNameLocalizations(metadata.nameLocalizations)
        .setDescriptionLocalizations(metadata.descriptionLocalizations)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption((option) => option
          .setName('amount')
          .setDescription('Number of messages to delete (1-100)')
          .setNameLocalizations(metadata.nameLocalizations)
          .setDescriptionLocalizations(metadata.options.amount.nameLocalizations)
          .setMinValue(1)
          .setMaxValue(100)
          .setRequired(true),
        );
    });
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const deferReplyResult = await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (! interaction.inGuild()) {
      const message = this._i18n.t('slashCommands.purge.responses.onlyInGuild', { lng: interaction.locale });
      await deferReplyResult.edit({ content: message });
      return;
    }

    const channel = interaction.channel;
    if (! channel || ! channel.isTextBased()) {
      const message = this._i18n.t('slashCommands.purge.responses.onlyInTextChannel', { lng: interaction.locale });
      await deferReplyResult.edit({ content: message });
      return;
    }

    const amount = interaction.options.getInteger('amount', true);

    const messages = await channel.messages.fetch({ limit: amount });

    if (messages.size === 0) {
      const message = this._i18n.t('slashCommands.purge.responses.noMessages', { lng: interaction.locale });
      await deferReplyResult.edit({ content: message });
      return;
    }

    await channel.bulkDelete(messages, true)
      .then((messages) => {
        const message = this._i18n.t('slashCommands.purge.responses.deleted', { lng: interaction.locale, count: messages.size });
        return deferReplyResult.edit({ content: message });
      }).catch(() => {
        const message = this._i18n.t('slashCommands.purge.responses.fetchMessagesError', { lng: interaction.locale });
        return deferReplyResult.edit({ content: message });
      });
  }
}
