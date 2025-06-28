import { ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { RateLimiterInterface, RateLimitResponse } from '#src/connection';

export default class NullRateLimiter implements RateLimiterInterface {
  public get available(): boolean {
    return true;
  }

  public async open(): Promise<Result<void, Error>> {
    return ok();
  }

  public async dispose(): Promise<Result<void, Error>> {
    return ok();
  }

  public async consume(): Promise<Result<RateLimitResponse, Error>> {
    return ok({
      remaining: Infinity,
      resetIn: 0,
    });
  }
}
