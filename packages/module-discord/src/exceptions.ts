import { RuntimeException } from '@framework/core/vendors/exceptions';

export class InteractionReplyException extends RuntimeException {
  public static status = 500;
  public static code = 'E_INTERACTION_REPLY_ERROR';

  public constructor(
    public readonly interactionId: string,
    cause?: unknown,
  ) {
    super(`Failed to reply to interaction '${interactionId}'`, { cause });
  }
}
