import { defineBaseConfig } from '@framework/core/config';
import type { HttpApiConfig } from '#src/config/types';

export const defineHttpApiConfig = (config: Partial<HttpApiConfig>) => defineBaseConfig<HttpApiConfig>('http.api', {
  port: config.port ?? 8080,
  host: config.host ?? '127.0.0.1',
  routes: config.routes ?? [],
});
