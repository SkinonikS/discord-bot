import type Application from '#/application';
import ConfigRepository from '#/config-repository';
import type { BootstrapperInterface, KernelConfigResolver } from '#/types';

declare module '@package/framework' {
  interface ContainerBindings {
    config: ConfigRepository;
  }
}

export default class LoadConfiguration implements BootstrapperInterface {
  public constructor(
    protected readonly _kernelConfigResolver: KernelConfigResolver,
  ) {
    //
  }

  public async bootstrap(app: Application): Promise<void> {
    const config = await this._loadConfigFiles(app);

    app.container.bindValue(ConfigRepository, config);
    app.container.alias('config', ConfigRepository);
  }

  protected async _loadConfigFiles(app: Application): Promise<ConfigRepository> {
    const kernelConfig = (await this._kernelConfigResolver()).default;
    const configFiles = await kernelConfig.configFiles.load(app);

    return configFiles.reduce((carry, value) => {
      carry.set(value.key, value.config);
      return carry;
    }, new ConfigRepository());
  }
}
