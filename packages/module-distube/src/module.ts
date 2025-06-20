import { ConfigNotFoundException, type Application, type ConfigRepository, type ModuleInterface } from '@framework/core';
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

  public register(app: Application): void {
    app.container.singleton('distube', async () => {
      const discord: Client = await app.container.make('discord.client');
      const config: ConfigRepository = await app.container.make('config');
      const distubeConfig = config.get('distube');

      if (! distubeConfig) {
        throw new ConfigNotFoundException('distube');
      }

      const plugins = distubeConfig.plugins.map((pluginFactory) => pluginFactory.create(app));

      return new DisTube(discord, {
        emitNewSongOnly: true,
        plugins: await Promise.all(plugins),
        nsfw: distubeConfig.nsfw,
        ffmpeg: {
          path: distubeConfig.ffmpeg?.path,
        },
      });
    });

    app.container.singleton('distube.logger', async (container) => {
      const factory: LoggerFactoryInterface = await container.make('logger.factory');
      return factory.createLogger(this.id);
    });
  }

  public async boot(app: Application): Promise<void> {
    const distube = await app.container.make('distube');
    const logger = await app.container.make('distube.logger');

    const controller = new Controller(logger);
    distube.on(Events.DEBUG, (message) => controller.debug(message));
    distube.on(Events.ERROR, (error) => controller.error(error));
    distube.on(Events.PLAY_SONG, (queue) => controller.playSong(queue));
    distube.on(Events.FINISH, (queue) => controller.finish(queue));
  }
}
