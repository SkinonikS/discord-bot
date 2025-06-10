import { SpotifyPlugin } from '@distube/spotify';
import { YouTubePlugin } from '@distube/youtube';
import type { Application } from '@package/framework';
import { type ConfigRepository, type ModuleInterface } from '@package/framework';
import { type LoggerFactoryInterface, type LoggerInterface } from '@package/module-logger';
import { Client, Events } from 'discord.js';
import { DisTube, Events as DistubeEvents } from 'distube';
import type { DiscordConfig } from '#/types';

declare module '@package/framework' {
  interface ContainerBindings {
    'discord.client': Client;
    'discord.distube': DisTube;
    'discord.logger': LoggerInterface;
  }

  interface ConfigBindings {
    'discord': DiscordConfig;
  }
}

export default class DiscordModule implements ModuleInterface {
  public readonly id = 'discord-client';

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.bind(DisTube, async (container) => {
      const discord = await container.make('discord.client');

      return new DisTube(discord, {
        plugins: [
          new YouTubePlugin(),
        ],
      });
    });

    this._app.container.singleton(Client, async (container) => {
      const config: ConfigRepository = await container.make('config');
      const discordConfig = config.get('discord');

      if (! discordConfig) {
        throw new Error('Discord configuration is missing. Maybe you forgot to add it into `bootstrap/kernel.ts`?');
      }

      return new Client({
        intents: discordConfig.intents,
      });
    });

    this._app.container.singleton('discord.logger', async (container) => {
      const factory: LoggerFactoryInterface = await container.make('logger.factory');
      return factory.createLogger({
        name: this.id,
        level: 'debug', // TODO: make this configurable
      });
    });

    this._app.container.alias('discord.distube', DisTube);
    this._app.container.alias('discord.client', Client);

    this._app.onBooted(async (app) => {
      const discord = await app.container.make('discord.client');
      const config: ConfigRepository = await app.container.make('config');
      await discord.login(config.get('discord').token);
    });

    this._app.onShutdown(async (app) => {
      const discord = await app.container.make('discord.client');
      const logger = await app.container.make('discord.logger');

      if (discord.isReady()) {
        await discord.destroy();
        logger.info('Discord client has been destroyed');
      } else {
        logger.warn('Discord client was not ready, nothing to destroy');
      }
    });
  }

  public async boot(): Promise<void> {
    const distube = await this._app.container.make('discord.distube');
    const discord = await this._app.container.make('discord.client');
    const logger = await this._app.container.make('discord.logger');

    distube.on(DistubeEvents.ERROR, (error) => {
      logger.critical('DisTube encountered an error:', error);
    });

    discord.on(Events.ShardReady, (shardId) => {
      logger.info(`Shard ${String(shardId)} is reconnecting`);
    });

    discord.on(Events.ShardReconnecting, (shardId) => {
      logger.info(`Shard ${String(shardId)} is reconnecting`);
    });

    discord.on(Events.ShardResume, (shardId, replayedEvents) => {
      logger.info(`Shard ${String(shardId)} resumed with ${replayedEvents} events replayed`);
    });

    discord.on(Events.ShardDisconnect, (event, shardId) => {
      logger.warn(`Shard ${String(shardId)} disconnected: ${event.code}`);
    });

    discord.on(Events.ClientReady, (client) => {
      logger.info(`Discord client is ready as ${client.user.tag}`);
    });

    discord.on(Events.Error, (error) => {
      logger.error('Discord client encountered an error:', error);
    });
  }
}
