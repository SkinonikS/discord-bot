import { defineBaseConfig } from '@framework/core/config';
import type { RedisConfig } from '#src/config/types';

export const defineRedisConfig = (config: Partial<RedisConfig>) => defineBaseConfig<RedisConfig>('redis', {
  default: config.default ?? 'default',
  clients: config.clients ?? {},
});
