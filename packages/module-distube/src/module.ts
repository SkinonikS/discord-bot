import type { ErrorHandler } from '@framework/core/app';
import { type Application, type ConfigRepository, type ModuleInterface } from '@framework/core/app';
import type { Client } from '@module/discord/vendors/discordjs';
import type { LoggerInterface } from '@module/logger';
import { DisTube, Events } from 'distube';
import pkg from '#root/package.json';
import type { DisTubeConfig } from '#src/config/types';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'distube': DisTube;
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
    app.container.singleton('distube', async (container) => {
      const app = await container.make('app');
      const errorHandler: ErrorHandler = await container.make('errorHandler');
      const logger: LoggerInterface = await container.make('logger');
      const discord: Client = await container.make('discord.client');
      const config: ConfigRepository = await container.make('config');
      const distubeConfig = config.get('distube');

      const plugins = distubeConfig.plugins.map(async (pluginFactory) => pluginFactory.create(app));

      const distube = new DisTube(discord, {
        emitNewSongOnly: true,
        plugins: await Promise.all(plugins),
        nsfw: distubeConfig.nsfw,
        ffmpeg: {
          path: distubeConfig.ffmpeg?.path,
        },
      });

      distube.on(Events.DEBUG, (message) => logger.debug(message));
      distube.on(Events.ERROR, async (error) => errorHandler.handle(error));

      return distube;
    });
  }
}
