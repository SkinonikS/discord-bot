import type { RateLimiterInterface, RateLimitResponse } from '#src/types';

export default class NullRateLimiter implements RateLimiterInterface {
  public hit(): RateLimitResponse {
    return {
      isFirst: false,
      remaining: Infinity,
      resetInMs: 0,
    };
  }
}
