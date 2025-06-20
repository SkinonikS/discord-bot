import { Application, defineBaseConfig } from '@framework/core';
import type { Registry } from 'prom-client';
import type { PrometheusConfig } from './types';

export const getPrometheusRegistry = (app?: Application): Promise<Registry> => {
  app ??= Application.getInstance();
  return app.container.make('prometheus');
};

export const definePrometheusConfig = (config: Partial<PrometheusConfig>) => defineBaseConfig<PrometheusConfig>('prometheus', {
  metrics: config.metrics ?? [],
});
