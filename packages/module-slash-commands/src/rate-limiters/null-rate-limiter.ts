import { ok, type Result } from 'neverthrow';
import type { RateLimiterInterface, RateLimitResponse } from '#src/types';

export default class NullRateLimiter implements RateLimiterInterface {
  public setup(): Result<void, Error> {
    return ok();
  }

  public dispose(): Result<void, Error> {
    return ok();
  }

  public hit(): Result<RateLimitResponse, Error> {
    return ok({
      isFirst: false,
      remaining: Infinity,
      resetInMs: 0,
    });
  }
}
