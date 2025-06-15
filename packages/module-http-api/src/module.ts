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
    'http.api.router': ReturnType<typeof createRouter>;
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
      return logger.createLogger(this.id);
    });

    this._app.onBooted(async (app) => {
      const server = await app.container.make('http.api.server');
      const logger = await app.container.make('http.api.logger');
      const config: ConfigRepository = await app.container.make('config');
      const httpApiConfig = config.get('http.api');

      if (! httpApiConfig) {
        throw new ConfigNotFoundException([this.id]);
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

      server.close();
      logger.info('HTTP API server closed');
    });
  }

  public async boot(): Promise<void> {
    const router = await this._app.container.make('http.api.router');

    router.get('/ping', defineLazyEventHandler(() => {
      return import('./handlers/ping').then(m => m.default);
    }));

    router.get('/metrics', defineLazyEventHandler(() => {
      return import('./handlers/metrics').then(m => m.default);
    }));

    // router.get('/metrics', defineEventHandler(async ({ context }) => {
    //   const discord: Client = await context.container.make('discord.client');
    //   const config: ConfigRepository = await context.container.make('config');
    //   const logger = await context.container.make('http.api.logger');

    //   try {
    //     // Discord bot metrics
    //     const botMetrics = {
    //       isReady: discord.isReady(),
    //       uptime: (discord.uptime ?? 0) / 1000, // in seconds
    //       ping: discord.ws.ping,
    //       shardCount: discord.options.shardCount ?? 1,
    //       guilds: {
    //         count: discord.guilds.cache.size,
    //       },
    //       users: {
    //         count: discord.users.cache.size,
    //       },
    //       channels: {
    //         count: discord.channels.cache.size,
    //         voice: discord.channels.cache.filter(c => c?.type === 2).size,
    //         text: discord.channels.cache.filter(c => c?.type === 0).size,
    //       },
    //     };

    //     // Process metrics
    //     const processMetrics = {
    //       memory: {
    //         rss: process.memoryUsage().rss / 1024 / 1024, // in MB
    //         heapTotal: process.memoryUsage().heapTotal / 1024 / 1024, // in MB
    //         heapUsed: process.memoryUsage().heapUsed / 1024 / 1024, // in MB
    //         external: process.memoryUsage().external / 1024 / 1024, // in MB
    //         arrayBuffers: process.memoryUsage().arrayBuffers / 1024 / 1024, // in MB
    //       },
    //       cpu: {
    //         user: process.cpuUsage().user / 1000000, // in seconds
    //         system: process.cpuUsage().system / 1000000, // in seconds
    //       },
    //       uptime: process.uptime(), // in seconds
    //       versions: {
    //         node: process.version,
    //         v8: process.versions.v8,
    //       },
    //       platform: process.platform,
    //       arch: process.arch,
    //     };

    //     // System metrics
    //     const systemMetrics = {
    //       hostname: os.hostname(),
    //       platform: os.platform(),
    //       arch: os.arch(),
    //       release: os.release(),
    //       uptime: os.uptime(), // in seconds
    //       memory: {
    //         total: os.totalmem() / 1024 / 1024, // in MB
    //         free: os.freemem() / 1024 / 1024, // in MB
    //         used: (os.totalmem() - os.freemem()) / 1024 / 1024, // in MB
    //         usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100, // percentage
    //       },
    //       cpu: {
    //         cores: os.cpus().length,
    //         model: os.cpus()[0].model,
    //         load: os.loadavg(),
    //       },
    //     };

    //     return {
    //       timestamp: new Date().toISOString(),
    //       bot: botMetrics,
    //       process: processMetrics,
    //       system: systemMetrics,
    //     };
    //   } catch (error) {
    //     logger.error('Error generating metrics', error);

    //     return {
    //       error: 'Failed to generate metrics',
    //       timestamp: new Date().toISOString(),
    //     };
    //   }
    // }));
  }
}
