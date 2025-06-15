import { defineHttpApiConfig } from '@module/http-api';
import { LazyRouteLoader } from '@module/http-api';
import { Env } from '#/bootstrap/env';

export default defineHttpApiConfig({
  port: Env.HTTP_API_PORT,
  host: Env.HTTP_API_HOST,
  routes: new LazyRouteLoader([
    () => import('#/app/http/router'),
  ]),
});
