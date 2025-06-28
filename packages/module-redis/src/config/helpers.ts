import { defineBaseConfig } from '@framework/core/config';
import type { RedisConfig } from '#src/config/types';

export const defineRedisConfig = (config: Partial<RedisConfig>) => defineBaseConfig<RedisConfig>('redis', {
  host: config.host ?? 'localhost',
  port: config.port ?? 6379,
  password: config.password ?? undefined,
  secure: config.secure ?? false,
  database: config.database ?? 0,
});
