import { Application } from '@framework/core/app';
import type { Registry } from 'prom-client';

export const getPrometheusRegistry = (app?: Application): Promise<Registry> => {
  app ??= Application.getInstance();
  return app.container.make('prometheus');
};
