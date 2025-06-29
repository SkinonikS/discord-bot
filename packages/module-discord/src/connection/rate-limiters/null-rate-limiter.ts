import { ok } from '@framework/core/vendors/neverthrow';
import type { Result } from '@framework/core/vendors/neverthrow';
import type { RateLimiterInterface, RateLimitResponse } from '#src/connection';

export default class NullRateLimiter implements RateLimiterInterface {
  public get available(): boolean {
    return true;
  }

  public setup(): Result<void, Error> {
    return ok();
  }

  public dispose(): Result<void, Error> {
    return ok();
  }

  public consume(): Result<RateLimitResponse, Error> {
    return ok({
      isFirst: true,
      remaining: Infinity,
      resetInMs: 0,
    });
  }
}
