import { createServer } from 'node:http';
import type { Application, ConfigRepository, ErrorHandler, ModuleInterface } from '@framework/core/app';
import { importModule } from '@framework/core/utils';
import type { LoggerInterface } from '@module/logger';
import { toNodeListener, createApp } from 'h3';
import pkg from '#root/package.json';
import type { HttpApiConfig } from '#src/config/types';
import { DNSLookupException, PortAccessDeniedException, PortAlreadyInUseException } from '#src/exceptions';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'http.api.app': ReturnType<typeof createApp>;
    'http.api.server': ReturnType<typeof createServer>;
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
    app.container.singleton('http.api.app', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const httpApiConfig = config.get('http.api');

      const app = createApp({
        onRequest: async (event) => {
          const app = await container.make('app');
          event.context.app = app;
          event.context.container = app.container;
        },
      });

      for (const routerResolver of httpApiConfig.routes) {
        const router = await importModule(() => routerResolver());
        app.use(router);
      }

      return app;
    });

    app.container.singleton('http.api.server', async (container) => {
      const app = await container.make('http.api.app');
      return createServer(toNodeListener(app));
    });
  }

  public async start(app: Application): Promise<void> {
    const server = await app.container.make('http.api.server');
    const logger: LoggerInterface = await app.container.make('logger');
    const errorHandler: ErrorHandler = await app.container.make('errorHandler');
    const config: ConfigRepository = await app.container.make('config');
    const httpApiConfig = config.get('http.api');

    server.on('error', (error) => {
      if ('code' in error) {
        const code = String(error.code).toUpperCase();

        if (code === 'EADDRINUSE' || code === 'EACCES') {
          const address = 'address' in error ? String(error.address) : httpApiConfig.host;
          const port = 'port' in error ? Number(error.port) : httpApiConfig.port;

          if (code === 'EADDRINUSE') {
            error = new PortAlreadyInUseException(port, address, error);
          } else {
            error = new PortAccessDeniedException(port, address, error);
          }
        } else if (code === 'ENOTFOUND') {
          const hostname = 'hostname' in error ? String(error.hostname) : 'unknown';
          error = new DNSLookupException(hostname, error);
        }
      }

      errorHandler.handle(error);
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
  }

  public async shutdown(app: Application): Promise<void> {
    const server = await app.container.make('http.api.server');
    const logger: LoggerInterface = await app.container.make('logger');

    server.close(() => {
      logger.info('HTTP API server closed');
    });
  }
}
