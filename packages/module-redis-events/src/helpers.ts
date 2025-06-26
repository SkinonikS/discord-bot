import { Application, defineBaseConfig } from '@framework/core';
import type EventManager from '#/event-manager';
import type { EventsConfig } from '#/types';

export const getRedisActionMananager = (app?: Application): Promise<EventManager> => {
  app = app ?? Application.getInstance();
  return app.container.make('redis-events');
};

export const defineRedisEventsConfig = (config: Partial<EventsConfig>) => defineBaseConfig<EventsConfig>('redis-events', {
  channelName: config.channelName ?? 'events',
  database: config.database ?? 0,
  eventHandlers: config.eventHandlers ?? [],
});
