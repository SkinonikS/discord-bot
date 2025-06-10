import { createServer } from 'node:http';
import type { Application, ModuleInterface } from '@package/framework';
import type { LoggerFactoryInterface, LoggerInterface } from '@package/module-logger';
import type { Client } from 'discord.js';
import { createRouter, toNodeListener, createApp, defineEventHandler } from 'h3';

declare module '@package/framework' {
  interface ContainerBindings {
    'http.api.app': ReturnType<typeof createApp>;
    'http.api.router': ReturnType<typeof createRouter>;
    'http.api.server': ReturnType<typeof createServer>;
    'http.api.logger': LoggerInterface;
  }
}

declare module 'h3' {
  interface H3EventContext {
    app: Application;
    container: Application['container'];
  }
}

export default class HttpApiModule implements ModuleInterface {
  public readonly id: string = 'http-api';

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.singleton('http.api.router', () => {
      return createRouter();
    });

    this._app.container.singleton('http.api.app', () => {
      return createApp({
        onRequest: (event) => {
          event.context.app = this._app;
          event.context.container = this._app.container;
        },
      });
    });

    this._app.container.singleton('http.api.server', async (container) => {
      const router = await container.make('http.api.router');
      const app = await container.make('http.api.app');
      app.use(router);

      return createServer(toNodeListener(app));
    });

    this._app.container.singleton('http.api.logger', async (container) => {
      const logger: LoggerFactoryInterface = await container.make('logger.factory');
      return logger.createLogger({
        name: this.id,
        level: 'debug', // TODO: make this configurable
      });
    });

    this._app.onBooted(async (app) => {
      const server = await app.container.make('http.api.server');
      const logger = await app.container.make('http.api.logger');

      server.on('error', (error) => {
        logger.error(error);
      });

      server.listen(3000, () => {
        logger.info('HTTP API server started on port 3000');
      });
    });

    this._app.onShutdown(async (app) => {
      const server = await app.container.make('http.api.server');
      const logger = await app.container.make('http.api.logger');

      server.close();
      logger.info('HTTP API server closed');
    });
  }

  public async boot(): Promise<void> {
    const router = await this._app.container.make('http.api.router');

    router.get('/check', defineEventHandler(async ({ context }) => {
      const discordClient = await context.container.make('discord.client') as Client;

      return {
        isReady: discordClient.isReady(),
        uptime: ((discordClient.uptime ?? 0) / 1000),
      };
    }));
  }
}
