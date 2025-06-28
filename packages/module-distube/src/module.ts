import type { Application, ConfigRepository, ModuleInterface } from '@framework/core/app';
import type { LoggerFactoryInterface, LoggerInterface } from '@module/logger';
import type { Client } from 'discord.js';
import { DisTube, Events } from 'distube';
import pkg from '#root/package.json';
import type { DisTubeConfig } from '#src/config/types';
import Handler from '#src/handler';

declare module '@framework/core/app' {
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
      if (distubeConfig.isErr()) {
        throw distubeConfig.error;
      }

      const plugins = distubeConfig.value.plugins.map((pluginFactory) => pluginFactory.create(app));

      return new DisTube(discord, {
        emitNewSongOnly: true,
        plugins: await Promise.all(plugins),
        nsfw: distubeConfig.value.nsfw,
        ffmpeg: {
          path: distubeConfig.value.ffmpeg?.path,
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

    const controller = new Handler(
      await app.container.make('errorHandler'),
      await app.container.make('distube.logger'),
    );

    distube.on(Events.DEBUG, (message) => controller.debug(message));
    distube.on(Events.ERROR, (error) => controller.error(error));
  }
}
