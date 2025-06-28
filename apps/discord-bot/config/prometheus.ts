import { definePrometheusConfig } from '@module/prometheus/config';

export default definePrometheusConfig({
  metrics: [
    () => import('#/app/metrics/discord/ping'),
  ],
});
