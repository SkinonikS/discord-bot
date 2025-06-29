import type { RateLimiterDriverInterface } from '#src/config/types';
import type { RateLimiterInterface } from '#src/types';

export default class NullRateLimiterDriver implements RateLimiterDriverInterface {
  public async create(): Promise<RateLimiterInterface> {
    const { default: NullRateLimiter } = await import('#src/rate-limiters/null-rate-limiter');
    return new NullRateLimiter();
  }
}
