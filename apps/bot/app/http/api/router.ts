import { createRouter, defineLazyEventHandler, useBase } from 'h3';

const router = createRouter();

router.get('/ping', defineLazyEventHandler(() => {
  return import('#/app/http/api/routes/ping').then(module => module.default);
}));

router.get('/metrics', defineLazyEventHandler(() => {
  return import('#/app/http/api/routes/metrics').then(module => module.default);
}));

export default useBase('/', router.handler);
