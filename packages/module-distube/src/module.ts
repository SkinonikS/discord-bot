import { type Application, type ConfigRepository, type ModuleInterface, ConfigNotFoundException } from '@framework/core';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import type { Client } from 'discord.js';
import { DisTube, Events } from 'distube';
import pkg from '../package.json';
import Controller from '#/controller';
import type { DisTubeConfig } from '#/types';

declare module '@framework/core' {
  interface ContainerBindings {
    'distube': DisTube;
    'distube.logger': LoggerInterface;
  }

  interface ConfigBindings {
    'distube': DisTubeConfig;
  }
}

export default class DistubeModule implements ModuleInterface {
  public readonly id = pkg.name;
  public readonly author = pkg.author;
  public readonly version = pkg.version;

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.singleton(DisTube, async () => {
      const discord: Client = await this._app.container.make('discord.client');
      const config: ConfigRepository = await this._app.container.make('config');
      const distubeConfig = config.get('distube');

      if (! distubeConfig) {
        throw new ConfigNotFoundException([this.id]);
      }

      return new DisTube(discord, {
        emitNewSongOnly: true,
        plugins: distubeConfig.plugins,
        nsfw: distubeConfig.nsfw,
        ffmpeg: {
          path: distubeConfig.ffmpegPath,
        },
      });
    });

    this._app.container.singleton('distube.logger', async (container) => {
      const factory: LoggerFactoryInterface = await container.make('logger.factory');
      return factory.createLogger(this.id);
    });

    this._app.container.alias('distube', DisTube);
  }

  public async boot(): Promise<void> {
    const distube = await this._app.container.make('distube');
    const logger = await this._app.container.make('distube.logger');

    const controller = new Controller(logger);
    distube.on(Events.ERROR, (error) => controller.error(error));
    distube.on(Events.PLAY_SONG, (queue) => controller.playSong(queue));
    distube.on(Events.FINISH, (queue) => controller.finish(queue));
  }
}
