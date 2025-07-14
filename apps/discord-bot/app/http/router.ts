import { createRouter, defineLazyEventHandler, useBase } from '@module/http-api/vendors/h3';

const router = createRouter();

// used in Kubernetes readiness probes
// DO NOT REMOVE UNLESS YOU KNOW WHAT YOU ARE DOING
router.get('/livez', defineLazyEventHandler(() => {
  return import('#app/http/routes/livez').then(module => module.default);
}));

// used in Kubernetes readiness probes
// DO NOT REMOVE UNLESS YOU KNOW WHAT YOU ARE DOING
router.get('/readyz', defineLazyEventHandler(() => {
  return import('#app/http/routes/readyz').then(module => module.default);
}));

// used for prometheus metrics
// DO NOT REMOVE UNLESS YOU KNOW WHAT YOU ARE DOING
router.get('/metrics', defineLazyEventHandler(() => {
  return import('#app/http/routes/metrics').then(module => module.default);
}));

export default useBase('/', router.handler);
