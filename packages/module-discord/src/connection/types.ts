import type { Result } from 'neverthrow';

export interface RateLimiterInterface {
  get available(): boolean;
  open(): Promise<Result<void, Error>>;
  dispose(): Promise<Result<void, Error>>;
  consume(): Promise<Result<RateLimitResponse, Error>>;
}

export interface RateLimitResponse {
  remaining: number;
  resetIn: number;
}
