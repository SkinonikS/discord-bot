import type { RateLimiterInterface, RateLimitResponse } from '#src/connection';

export default class NullRateLimiter implements RateLimiterInterface {
  public consume(): RateLimitResponse {
    return {
      isFirst: true,
      remaining: Infinity,
      resetInMs: 0,
    };
  }
}
