import { Application } from '@framework/core/app';
import type { RedisClientType } from 'redis';

export const getRedis = (app?: Application): Promise<RedisClientType> => {
  app ??= Application.getInstance();
  return app.container.make('redis.client');
};
