import { Exception } from '@framework/core/vendors/exceptions';

export class CommandNotFoundException extends Exception {
  public static status = 404;
  public static code = 'E_SLASH_COMMAND_NOT_FOUND';

  public constructor(public readonly commandName: string, cause?: Error) {
    super(`Slash command '${commandName}' not found. Maybe you forgot to register it?`, { cause });
  }
}

export class RateLimitExceededException extends Exception {
  public static status = 429;
  public static code = 'E_RATE_LIMIT_EXCEEDED';

  public constructor(
    public readonly userId: string,
    public readonly commandName: string,
    cause?: Error,
  ) {
    super(`User '${userId}' tried to use command '${commandName}' on cooldown.`, { cause });
  }
}

export class DiscordClientNotReadyException extends Exception {
  public static status = 503;
  public static code = 'E_DISCORD_CLIENT_NOT_READY';

  public constructor(cause?: unknown) {
    super('Discord client is not ready. Cannot deploy commands.', { cause });
  }
}

export class RateLimitRetrievalException extends Exception {
  public static status = 500;
  public static code = 'E_RATE_LIMIT_RETRIEVAL_ERROR';

  public constructor(
    public readonly userId: string,
    public readonly commandName: string,
    cause?: unknown,
  ) {
    super(`Failed to get rate limits for user '${userId}' for command '${commandName}'.`, { cause });
  }
}
