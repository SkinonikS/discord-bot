import type Application from '#/application';
import ConfigRepository from '#/config-repository';
import { importModule } from '#/helpers';
import type { BootstrapperInterface, ConfigFileResolver } from '#/types';

declare module '@framework/core' {
  interface ContainerBindings {
    config: ConfigRepository;
  }
}

export default class LoadConfigurationBootstrapper implements BootstrapperInterface {
  public constructor(
    protected readonly _configFiles: ConfigFileResolver[],
  ) {
    //
  }

  public async bootstrap(app: Application): Promise<void> {
    const config = new ConfigRepository();

    for (const configFileResolver of this._configFiles) {
      const configFile = await importModule(() => configFileResolver());
      config.set(configFile.key, configFile.config);
    }

    app.container.bindValue('config', config);
  }
}
