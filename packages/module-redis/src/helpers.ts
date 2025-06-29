import { Application } from '@framework/core/app';
import type { RedisClientType } from 'redis';
import type Manager from '#src/manager';

export const getRedisManager = (app?: Application): Promise<Manager> => {
  app ??= Application.getInstance();
  return app.container.make('redis');
};

export const getDefaultRedisClient = (app?: Application): Promise<RedisClientType> => {
  app ??= Application.getInstance();
  return app.container.make('redis.client');
};
