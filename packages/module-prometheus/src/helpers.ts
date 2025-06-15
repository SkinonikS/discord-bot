import { Application, defineBaseConfig } from '@framework/core';
import type { Registry } from 'prom-client';
import type { PrometheusConfig } from './types';
import NullMetricLoader from '#/metric-loaders/null-metric-loader';

export const getPrometheusRegistry = (app?: Application): Promise<Registry> => {
  app ??= Application.getInstance();
  return app.container.make('prometheus');
};

export const definePrometheusConfig = (config: Partial<PrometheusConfig>) => defineBaseConfig<PrometheusConfig>('prometheus', {
  metrics: config.metrics ?? new NullMetricLoader(),
});
