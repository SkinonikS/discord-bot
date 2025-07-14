import { FatalErrorException } from '@framework/core/app';

export class DiscordConnectionFailedException extends FatalErrorException {
  static code = 'DiscordConnectionFailed';
  static status = 500;

  constructor(cause?: unknown) {
    super('Failed to connect to Discord gateway.', { cause });
  }
}
