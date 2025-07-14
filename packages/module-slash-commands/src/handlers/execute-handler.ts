import type { Application } from '@framework/core/app';
import { MessageFlags } from '@module/discord/vendors/discordjs';
import type { ChatInputCommandInteraction } from '@module/discord/vendors/discordjs';
import type { LoggerInterface } from '@module/logger';
import { DateTime } from 'luxon';
import type Manager from '#src/manager';
import type { RateLimiterInterface, RateLimitMessage } from '#src/types';

export default class ExecuteHandler {
  public constructor(
    protected readonly _app: Application,
    protected readonly _manager: Manager,
    protected readonly _logger: LoggerInterface,
    protected readonly _rateLimiter: RateLimiterInterface,
    protected readonly _rateLimitMessage: RateLimitMessage,
  ) { }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this._manager.getCommand(interaction.commandName);
    if (! command) {
      this._logger.warn(`Slash-command not found: ${interaction.commandName}.`);
      return;
    }

    const rateLimitResult = await this._rateLimiter.hit(interaction.user.id);
    if (! rateLimitResult.isFirst && rateLimitResult.remaining <= 0) {
      const expiredTimestamp = Math.round(DateTime.now().plus({ millisecond: rateLimitResult.resetInMs }).toSeconds());
      const message = await this._rateLimitMessage(this._app, expiredTimestamp, interaction.locale);

      await interaction.reply({
        content: message,
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    await command.execute(interaction);
  }
}
