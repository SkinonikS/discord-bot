import { Application, defineBaseConfig } from '@framework/core';
import type RedisActionManager from '#/redis-action-manager';
import type { RedisActionsConfig } from '#/types';

export const getRedisActionMananager = (app?: Application): Promise<RedisActionManager> => {
  app = app ?? Application.getInstance();
  return app.container.make('redis-actions');
};

export const defineRedisActionsConfig = (config: Partial<RedisActionsConfig>) => defineBaseConfig<RedisActionsConfig>('redis-actions', {
  url: config.url ?? 'redis://localhost:6379',
  database: config.database ?? 0,
  actions: config.actions ?? [],
});
