import { defineBaseConfig } from '@framework/core/config';
import type { LoggerConfig } from '#src/config/types';

export const defineLoggerConfig = (config: Partial<LoggerConfig>) => defineBaseConfig<LoggerConfig>('logger', {
  label: config.label ?? 'DiscordBOT',
  defaultMeta: config.defaultMeta ?? {},
  level: config.level ?? 'info',
  showStackTraces: config.showStackTraces ?? false,
  transports: config.transports ?? [],
});
