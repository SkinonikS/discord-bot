import type { BootstrapperInterface, KernelConfigResolver } from '#/types';
import type { Application } from '#application/application';
import { ConfigRepository } from '#config/config-repository';

declare module '@package/framework' {
  interface ContainerBindings {
    config: ConfigRepository;
  }
}

export default class LoadConfiguration implements BootstrapperInterface {
  public constructor(
    protected readonly _loadKernelConfig: KernelConfigResolver,
  ) {
    //
  }

  public async bootstrap(app: Application): Promise<void> {
    const config = await this._loadConfigFiles();
    app.container.bindValue('config', config);
  }

  protected async _loadConfigFiles(): Promise<ConfigRepository> {
    const config = new ConfigRepository();

    const kernelConfig = (await this._loadKernelConfig()).default;
    for (const configFilesResolver of kernelConfig.configFiles) {
      const ResolvedConfig = (await configFilesResolver()).default;
      config.merge({ [ResolvedConfig.key]: ResolvedConfig.config });
    }

    return config;
  }
}
