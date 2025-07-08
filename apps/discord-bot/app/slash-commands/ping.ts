import { tap } from '@framework/core/utils';
import { err, fromSafePromise, ok } from '@framework/core/vendors/neverthrow';
import type { Result } from '@framework/core/vendors/neverthrow';
import type { ChatInputCommandInteraction } from '@module/discord/vendors/discordjs';
import { SlashCommandBuilder, MessageFlags } from '@module/discord/vendors/discordjs';
import type { i18n } from '@module/i18n/vendors/i18next';
import type { SlashCommandInterface } from '@module/slash-commands';
import type LocalizationGenerator from '#app/internal/slash-commands/localization-generator';

export default class PingCommand implements SlashCommandInterface {
  static containerInjections = {
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

  public async execute(interaction: ChatInputCommandInteraction): Promise<Result<void, Error>> {
    const replyResult = await fromSafePromise(interaction.reply({
      content: this._i18n.t('slashCommands.ping.responses.pinging', { lng: interaction.locale }),
      flags: MessageFlags.Ephemeral,
      withResponse: true,
    }));
    if (replyResult.isErr()) {
      return err(replyResult.error);
    }

    const latency = (replyResult.value.resource?.message?.createdTimestamp ?? 0) - replyResult.value.interaction.createdTimestamp;
    const editReplyResult = await fromSafePromise(interaction.editReply({
      content: this._i18n.t('slashCommands.ping.responses.pingMs', { lng: interaction.locale, latency }),
    }));
    if (editReplyResult.isErr()) {
      return err(editReplyResult.error);
    }

    return ok();
  }
}
