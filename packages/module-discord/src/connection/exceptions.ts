import { FatalErrorException } from '@framework/core/app';
import { Exception } from '@framework/core/vendors/exceptions';

export class DiscordConnectionException extends FatalErrorException {
  static code = 'E_DISCORD_CONNECTION';
  static status = 500;

  constructor(cause?: unknown) {
    super('Failed to connect to Discord gateway', { cause });
  }
}

export class DiscordRateLimitException extends Exception {
  static code = 'E_DISCORD_RATE_LIMIT';
  static status = 429;

  constructor(resetInMs: number, cause?: unknown) {
    super(`Discord hit the gateway rate limit, waiting ${resetInMs}ms before retrying...`, { cause });
  }
}
