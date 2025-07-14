import type { Application, ConfigRepository, ModuleInterface } from '@framework/core/app';
import pkg from '#root/package.json';
import type { LoggerConfig } from '#src/config/types';
import type { LoggerInterface } from '#src/types';

declare module '@framework/core/app' {
  interface ContainerBindings {
    'logger': LoggerInterface;
  }

  interface ConfigBindings {
    'logger': LoggerConfig;
  }
}

export default class LoggerModule implements ModuleInterface {
  public readonly id = pkg.name;
  public readonly author = pkg.author;
  public readonly version = pkg.version;

  public register(app: Application): void {
    app.container.singleton('logger', async (container) => {
      const config: ConfigRepository = await container.make('config');
      const loggerConfig = config.get('logger');

      return loggerConfig.driver.create(app, {
        defaultTags: loggerConfig.defaultTags,
      });
    });
  }
}
