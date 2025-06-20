import { definePrometheusConfig } from '@module/prometheus';

export default definePrometheusConfig({
  metrics: [
    () => import('#/app/metrics/discord/ping'),
  ],
});
