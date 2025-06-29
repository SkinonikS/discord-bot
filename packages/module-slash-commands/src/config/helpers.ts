import { defineBaseConfig } from '@framework/core/config';
import { NullRateLimiterDriver } from '#src/config/rate-limiter-drivers';
import type { SlashCommandConfig } from '#src/config/types';

export const defineSlashCommandsConfig = (config: Partial<SlashCommandConfig>) => defineBaseConfig<SlashCommandConfig>('slash-commands', {
  commands: config.commands ?? [],
  rateLimiter: config.rateLimiter ?? {
    driver: new NullRateLimiterDriver(),
    points: 5,
    durationMs: 6000,
  },
});
