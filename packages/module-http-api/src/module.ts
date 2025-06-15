import { createServer } from 'node:http';
import type { Application } from '@framework/core';
import { ConfigNotFoundException, type ConfigRepository, type ModuleInterface } from '@framework/core';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { createRouter, toNodeListener, createApp, defineLazyEventHandler } from 'h3';
import pkg from '../package.json';
import type { HttpApiConfig } from '#/types';

declare module '@framework/core' {
  interface ContainerBindings {
    'http.api.app': ReturnType<typeof createApp>;
    'http.api.server': ReturnType<typeof createServer>;
    'http.api.logger': LoggerInterface;
  }

  interface ConfigBindings {
    'http.api': HttpApiConfig;
  }
}

declare module 'h3' {
  interface H3EventContext {
    app: Application;
    container: Application['container'];
  }
}

export default class HttpApiModule implements ModuleInterface {
  public readonly id = pkg.name;
  public readonly author = pkg.author;
  public readonly version = pkg.version;

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.singleton('http.api.app', () => {
      return createApp({
        onRequest: (event) => {
          event.context.app = this._app;
          event.context.container = this._app.container;
        },
      });
    });

    this._app.container.singleton('http.api.server', async (container) => {
      const app = await container.make('http.api.app');
      return createServer(toNodeListener(app));
    });

    this._app.container.singleton('http.api.logger', async (container) => {
      const logger: LoggerFactoryInterface = await container.make('logger.factory');
      return logger.createLogger(this.id);
    });

    this._app.onBooted(async (app) => {
      const server = await app.container.make('http.api.server');
      const logger = await app.container.make('http.api.logger');
      const h3 = await app.container.make('http.api.app');
      const config: ConfigRepository = await app.container.make('config');
      const httpApiConfig = config.get('http.api');

      if (! httpApiConfig) {
        throw new ConfigNotFoundException([this.id]);
      }

      const routes = await httpApiConfig.routes.load(app);
      for (const route of routes) {
        h3.use(route);
      }

      server.on('error', (error) => {
        logger.error(error);
      });

      server.listen({
        port: httpApiConfig.port,
        host: httpApiConfig.host,
      }, () => {
        const address = server.address();
        const port = typeof address === 'string' ? address : address?.port;
        const host = typeof address === 'string' ? 'localhost' : address?.address || 'localhost';
        logger.info(`HTTP API server is listening on http://${host}:${port}`);
      });
    });

    this._app.onShutdown(async (app) => {
      const server = await app.container.make('http.api.server');
      const logger = await app.container.make('http.api.logger');

      server.close(() => {
        logger.info('HTTP API server closed');
      });
    });
  }
}
