import { LazyMetricLoader, definePrometheusConfig } from '@module/prometheus';

export default definePrometheusConfig({
  metrics: new LazyMetricLoader([
    () => import('#/app/metrics/discord/ping-gauge'),
  ]),
});
