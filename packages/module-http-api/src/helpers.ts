import type { Server } from 'node:http';
import { Application, defineBaseConfig } from '@framework/core';
import type { App, Router } from 'h3';
import type { HttpApiConfig } from '#/types';

export const getH3App = (app?: Application): Promise<App> => {
  app ??= Application.getInstance();
  return app.container.make('http.api.app');
};

export const getH3Router = (app?: Application): Promise<Router> => {
  app ??= Application.getInstance();
  return app.container.make('http.api.router');
};

export const getH3Server = (app?: Application): Promise<Server> => {
  app ??= Application.getInstance();
  return app.container.make('http.api.server');
};

export const defineHttpApiConfig = (config: Partial<HttpApiConfig>) => defineBaseConfig<HttpApiConfig>('http.api', {
  port: config.port ?? 8080,
  host: config.host ?? '127.0.0.1',
  routes: config.routes ?? [],
});
