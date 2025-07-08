import { tap } from '@framework/core/utils';
import { err, fromSafePromise } from '@framework/core/vendors/neverthrow';
import type { Result } from '@framework/core/vendors/neverthrow';
import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from '@module/discord/vendors/discordjs';
import type { ChatInputCommandInteraction } from '@module/discord/vendors/discordjs';
import type { i18n } from '@module/i18n/vendors/i18next';
import type { SlashCommandInterface } from '@module/slash-commands';
import type LocalizationGenerator from '#app/internal/slash-commands/localization-generator';

export default class PurgeSlashCommand implements SlashCommandInterface {
  static containerInjections = {
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

  public async execute(interaction: ChatInputCommandInteraction): Promise<Result<void, Error>> {
    const deferReply = await fromSafePromise(interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    }));

    if (deferReply.isErr()) {
      return err(deferReply.error);
    }

    const amount = interaction.options.getInteger('amount', true);

    if (! interaction.inGuild()) {
      return fromSafePromise(deferReply.value.edit({
        content: this._i18n.t('slashCommands.purge.responses.onlyInGuild', { lng: interaction.locale }),
      })).map(() => void 0);
    }

    const channel = interaction.channel;
    if (! channel || ! channel.isTextBased()) {
      return fromSafePromise(deferReply.value.edit({
        content: this._i18n.t('slashCommands.purge.responses.onlyInTextChannel', { lng: interaction.locale }),
      })).map(() => void 0);
    }

    const messagesResult = await fromSafePromise(interaction.channel.messages.fetch({ limit: amount }));
    if (messagesResult.isErr()) {
      return fromSafePromise(deferReply.value.edit({
        content: this._i18n.t('slashCommands.purge.responses.fetchMessagesError', { lng: interaction.locale }),
      })).map(() => void 0);
    }

    const bulkDeleteResult = await fromSafePromise(channel.bulkDelete(messagesResult.value, true));
    if (bulkDeleteResult.isErr()) {
      return fromSafePromise(deferReply.value.edit({
        content: this._i18n.t('slashCommands.purge.responses.bulkDeleteError', { lng: interaction.locale }),
      })).map(() => void 0);
    }

    return fromSafePromise(deferReply.value.edit({
      content: this._i18n.t('slashCommands.purge.responses.deleted', { lng: interaction.locale, count: bulkDeleteResult.value.size }),
    })).map(() => void 0);
  }
}
