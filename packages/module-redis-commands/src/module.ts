import { ConfigNotFoundException, type Application, type ConfigRepository, type ModuleInterface } from '@framework/core';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import { fromPromise } from 'neverthrow';
import { createClient } from 'redis';
import { flattenError, treeifyError, z } from 'zod/v4';
import pkg from '../package.json';
import { safeJsonParse } from './helpers';
import RedisCommandManager from './redis-command-manager';
import type { RedisCommandsConfig } from '#/types';

declare module '@framework/core' {
  interface ContainerBindings {
    'redis-commands': RedisCommandManager;
    'redis-commands.client': ReturnType<typeof createClient>;
    'redis-commands.logger': LoggerInterface;
  }

  interface ConfigBindings {
    'redis-commands': RedisCommandsConfig;
  }
}

export default class RedisCommansModule implements ModuleInterface {
  public readonly id: string = pkg.name;
  public readonly author: string = pkg.author;
  public readonly version: string = pkg.version;

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.singleton('redis-commands', async (container) => {
      return new RedisCommandManager(await container.make('app'));
    });

    this._app.container.singleton('redis-commands.client', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const redisConfig = config.get('redis-commands');

      if (! redisConfig) {
        throw new ConfigNotFoundException([this.id]);
      }

      return createClient({
        url: redisConfig.url,
        socket: {
          reconnectStrategy: false,
        },
      });
    });

    this._app.container.singleton('redis-commands.logger', async (container) => {
      const loggerFactory: LoggerFactoryInterface = await container.make('logger.factory');
      return loggerFactory.createLogger(this.id);
    });

    this._app.onBooted(async (app) => {
      const commands = await app.container.make('redis-commands');
      const logger = await app.container.make('redis-commands.logger');
      const redis = await app.container.make('redis-commands.client');

      const conRes = await fromPromise(redis.connect(), (err) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return new Error(`Failed to connect to Redis: ${errorMessage}`);
      });

      if (conRes.isErr()) {
        logger.warn(conRes.error);
        return;
      }

      logger.info('Redis subscriber is ready and listening for commands');

      redis.subscribe('discord-command', async (message) => {
        if (! message || typeof message !== 'string') {
          return;
        }

        const parseRes = safeJsonParse(message);

        if (parseRes.isErr()) {
          logger.debug(`Failed to parse message: ${message}`);
          return;
        }

        const redisCommandRaw = z.object({
          command: z.string(),
          args: z.record(z.string(), z.any()).default({}),
        }).safeParse(parseRes.value);

        if (! redisCommandRaw.success) {
          logger.debug(`Invalid command format: ${message}`);
          return;
        }

        const execRes = await commands.execute(redisCommandRaw.data.command, redisCommandRaw.data.args);

        if (execRes.isErr()) {
          logger.debug(execRes.error.message);
          return;
        }
      });
    });

    this._app.onShutdown(async (app) => {
      const redis = await app.container.make('redis-commands.client');
      const logger = await app.container.make('redis-commands.logger');

      await redis.unsubscribe('discord-command');
      await redis.quit();

      logger.info('Redis subscriber has been unsubscribed and client disconnected');
    });
  }

  public async boot(): Promise<void> {
    const commands = await this._app.container.make('redis-commands');
    const config: ConfigRepository = await this._app.container.make('config');
    const redisCommandConfig = config.get('redis-commands');

    if (! redisCommandConfig) {
      throw new ConfigNotFoundException([this.id]);
    }

    await commands.register(redisCommandConfig.commands);
  }
}
