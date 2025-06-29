import type { Result } from 'neverthrow';

export interface RateLimiterInterface {
  get available(): boolean;
  setup(): Promise<Result<void, Error>> | Result<void, Error>;
  dispose(): Promise<Result<void, Error>> | Result<void, Error>;
  consume(): Promise<Result<RateLimitResponse, Error>> | Result<RateLimitResponse, Error>;
}

export interface RateLimitResponse {
  isFirst: boolean;
  remaining: number;
  resetInMs: number;
}
