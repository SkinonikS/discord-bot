import { defineBaseConfig } from '@framework/core/config';
import type { PrometheusConfig } from '#src/config/types';

export const definePrometheusConfig = (config: Partial<PrometheusConfig>) => defineBaseConfig<PrometheusConfig>('prometheus', {
  metrics: config.metrics ?? [],
});
