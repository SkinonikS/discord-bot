import { createRouter, defineLazyEventHandler, useBase } from 'h3';

const router = createRouter();

router.get('/livez', defineLazyEventHandler(() => {
  return import('#/app/http/routes/livez').then(module => module.default);
}));

router.get('/readyz', defineLazyEventHandler(() => {
  return import('#/app/http/routes/readyz').then(module => module.default);
}));

router.get('/metrics', defineLazyEventHandler(() => {
  return import('#/app/http/routes/metrics').then(module => module.default);
}));

export default useBase('/', router.handler);
