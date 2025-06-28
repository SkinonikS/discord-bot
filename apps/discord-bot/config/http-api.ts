import { defineHttpApiConfig } from '@module/http-api/config';
import { Env } from '#/bootstrap/env';

export default defineHttpApiConfig({
  port: Env.HTTP_API_PORT,
  host: Env.HTTP_API_HOST,
  routes: [
    () => import('#/app/http/router'),
  ],
});
