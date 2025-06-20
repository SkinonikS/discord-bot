import { safeJsonParse } from '@framework/core';
import type { LoggerInterface } from '@module/logger';
import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod/v4';
import type RedisActionManager from '#/redis-action-manager';

export class InvalidActionFormatException extends Error {
  static readonly statusCode = 400;
  static readonly code = 'E_INVALID_MESSAGE_FORMAT';
}

export class DiscordActionHandler {
  public constructor(
    protected readonly _actions: RedisActionManager,
    protected readonly _logger: LoggerInterface,
  ) { }

  public async handle(message: string): Promise<Result<void, Error>> {
    if (! message || typeof message !== 'string') {
      this._logger.debug('Received message is not a valid string');
      return err(new InvalidActionFormatException('Action should be a valid JSON string'));
    }

    const parseResult = safeJsonParse(message);

    if (parseResult.isErr()) {
      this._logger.debug('Received action is not a valid JSON string');
      return err(new InvalidActionFormatException(parseResult.error.message));
    }

    const redisCommandRaw = z.object({
      command: z.string(),
      guildId: z.string(),
      args: z.record(z.string(), z.any()).default({}),
    }).safeParse(parseResult.value);

    if (! redisCommandRaw.success) {
      this._logger.debug('Invalid action payload');
      return err(new InvalidActionFormatException('Invalid action payload'));
    }

    const executeResult = await this._actions.execute(redisCommandRaw.data.command, {
      guildId: redisCommandRaw.data.guildId,
      args: redisCommandRaw.data.args,
    });

    if (executeResult.isErr()) {
      this._logger.debug(executeResult.error.message);
      return executeResult;
    }

    return ok();
  }
}
