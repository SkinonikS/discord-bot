import { ConfigRepository } from '#core/application/config/config-repository';
import { Application } from '#core/application/application';
import { BootstrapperInterface } from '#core/kernel/types';
import BootstrapConfig from '#bootstrap/app';

export default class LoadConfiguration implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void> {
    const config = await this._loadConfig();
    app.container.bind('Config').toConstantValue(config);
  }

  protected async _loadConfig(): Promise<ConfigRepository> {
    const config = new ConfigRepository();

    for (const configFilesResolvers of BootstrapConfig.configFiles) {
      const ResolvedConfig = (await configFilesResolvers()).default;
      config.merge({ [ResolvedConfig.key]: ResolvedConfig.config });
    }

    return config;
  }
}
