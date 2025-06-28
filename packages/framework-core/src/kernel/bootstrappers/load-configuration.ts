import type Application from '#src/app/application';
import ConfigRepository from '#src/app/config-repository';
import type { ConfigFileResolver } from '#src/config/types';
import type { BootstrapperInterface } from '#src/kernel/types';
import { importModule } from '#src/utils/helpers';

declare module '@framework/core/app' {
  interface ContainerBindings {
    config: ConfigRepository;
  }
}

export default class LoadConfiguration implements BootstrapperInterface {
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
