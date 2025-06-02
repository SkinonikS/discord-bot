import type { Server } from 'node:http';
import { Application } from '@package/framework';
import type { App, Router } from 'h3';

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
