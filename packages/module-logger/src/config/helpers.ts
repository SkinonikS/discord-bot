import { defineBaseConfig } from '@framework/core/config';
import NullLoggerDriver from '#src/config/logger-drivers/null-logger-driver';
import type { LoggerConfig } from '#src/config/types';

export const defineLoggerConfig = (config: Partial<LoggerConfig>) => defineBaseConfig<LoggerConfig>('logger', {
  defaultTags: config.defaultTags ?? {},
  driver: config.driver ?? new NullLoggerDriver(),
});
