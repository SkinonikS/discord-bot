import { createServer } from 'node:http';
import type { Application, ConfigRepository, ErrorHandler, ModuleInterface } from '@framework/core/app';
import { importModule } from '@framework/core/utils';
import type { LoggerInterface } from '@module/logger';
import { toNodeListener, createApp } from 'h3';
import pkg from '#root/package.json';
import type { HttpApiConfig } from '#src/config/types';

declare module '@framework/core/app' {
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

  public register(app: Application): void {
    app.container.singleton('http.api.app', (container) => {
      return createApp({
        onRequest: async (event) => {
          const app = await container.make('app');
          event.context.app = app;
          event.context.container = app.container;
        },
      });
    });

    app.container.singleton('http.api.server', async (container) => {
      const app = await container.make('http.api.app');
      return createServer(toNodeListener(app));
    });

    app.container.singleton('http.api.logger', async (container) => {
      const logger: LoggerInterface = await container.make('logger');
      return logger.copy(this.id);
    });
  }

  public async boot(app: Application): Promise<void> {
    const h3 = await app.container.make('http.api.app');
    const config: ConfigRepository = await app.container.make('config');
    const httpApiConfig = config.get('http.api');
    if (httpApiConfig.isErr()) {
      throw httpApiConfig.error;
    }

    for (const routerResolver of httpApiConfig.value.routes) {
      const router = await importModule(() => routerResolver());
      h3.use(router);
    }
  }

  public async start(app: Application): Promise<void> {
    const errorHandler: ErrorHandler = await app.container.make('errorHandler');
    const server = await app.container.make('http.api.server');
    const logger = await app.container.make('http.api.logger');
    const config: ConfigRepository = await app.container.make('config');
    const httpApiConfig = config.get('http.api');
    if (httpApiConfig.isErr()) {
      throw httpApiConfig.error;
    }

    server.on('error', (error) => {
      errorHandler.handle(error);
    });

    server.listen({
      port: httpApiConfig.value.port,
      host: httpApiConfig.value.host,
    }, () => {
      const address = server.address();
      const port = typeof address === 'string' ? address : address?.port;
      const host = typeof address === 'string' ? 'localhost' : address?.address || 'localhost';
      logger.info(`HTTP API server is listening on http://${host}:${port}`);
    });
  }

  public async shutdown(app: Application): Promise<void> {
    const server = await app.container.make('http.api.server');
    const logger = await app.container.make('http.api.logger');

    server.close(() => {
      logger.info('HTTP API server closed');
    });
  }
}
