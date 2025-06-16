import { defineBaseConfig } from '@framework/core';
import { fromThrowable } from 'neverthrow';
import NullRedisCommandLoader from '#/redis-command-loader/null-redis-command-loader';
import type { RedisCommandsConfig } from '#/types';

export const safeJsonParse = fromThrowable(JSON.parse, () => new Error('Invalid JSON format'));

export const defineRedisCommandsConfig = (config: Partial<RedisCommandsConfig>) => defineBaseConfig<RedisCommandsConfig>('redis-commands', {
  url: config.url ?? 'redis://localhost:6379',
  database: config.database ?? 0,
  commands: config.commands ?? new NullRedisCommandLoader(),
});
