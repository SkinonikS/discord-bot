import { createServer } from 'node:http';
import type { Application, ServiceProviderInterface } from '@package/framework';
import { createLogSource, type LoggerInterface } from '@package/module-logger';
import type { Client } from 'discord.js';
import { createRouter, toNodeListener } from 'h3';
import { createApp, defineEventHandler } from 'h3';

declare module '@package/framework' {
  interface ContainerBindings {
    'http.api.app': ReturnType<typeof createApp>;
    'http.api.router': ReturnType<typeof createRouter>;
    'http.api.server': ReturnType<typeof createServer>;
  }
}

export default class HttpApiServiceProvider implements ServiceProviderInterface {
  protected declare _logger: LoggerInterface;

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.singleton('http.api.router', () => {
      return createRouter();
    });

    this._app.container.singleton('http.api.app', () => {
      return createApp();
    });

    this._app.container.singleton('http.api.server', async (container) => {
      const router = await container.make('http.api.router');
      const app = await container.make('http.api.app');
      app.use(router);

      router.get('/check', defineEventHandler(async () => {
        const discordClient = await container.make('discord.client') as Client;

        return {
          isReady: discordClient.isReady(),
          uptime: ((discordClient.uptime ?? 0) / 1000),
        };
      }));

      const server = createServer(toNodeListener(app));

      server.on('listening', () => {
        const address = server.address();

        if (typeof address === 'string') {
          this._logger.info(`HTTP API server listening on ${address}`);
        } else if (address) {
          this._logger.info(`HTTP API server listening on ${address.address}:${address.port}`);
        }
      });

      server.on('error', (error) => {
        this._logger.error('Shutting down the application due to HTTP API server error:', error);
        process.exit(1);
      });

      return server;
    });
  }

  public async boot(): Promise<void> {
    this._logger = await createLogSource('Http');
  }
}
