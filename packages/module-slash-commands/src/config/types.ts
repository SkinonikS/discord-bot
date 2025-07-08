import type { Application } from '@framework/core/app';
import type { BaseResolver } from '@framework/core/kernel';
import type { SlashCommandInterface, RateLimiterInterface } from '#src/types';

export type SlashCommandResolver = BaseResolver<new (...args: unknown[]) => SlashCommandInterface>;

export interface SlashCommandConfig extends Record<string, unknown> {
  commands: SlashCommandResolver[];
  rateLimiter: {
    driver: RateLimiterDriverInterface;
    points: number;
    durationMs: number;
    message: (app: Application, expiredTimestamp: number, locale: string) => Promise<string> | string;
  };
}

export interface RateLimiterGlobalConfig {
  points: number;
  durationMs: number;
}

export interface RateLimiterDriverInterface {
  create(app: Application, config: RateLimiterGlobalConfig): Promise<RateLimiterInterface>;
}
