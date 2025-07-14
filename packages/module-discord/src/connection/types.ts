export interface RateLimiterInterface {
  consume(): Promise<RateLimitResponse> | RateLimitResponse;
}

export interface RateLimitResponse {
  isFirst: boolean;
  remaining: number;
  resetInMs: number;
}
