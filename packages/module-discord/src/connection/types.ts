import type { Result } from '@framework/core/vendors/neverthrow';

export interface RateLimiterInterface {
  consume(): Promise<Result<RateLimitResponse, Error>> | Result<RateLimitResponse, Error>;
}

export interface RateLimitResponse {
  isFirst: boolean;
  remaining: number;
  resetInMs: number;
}
