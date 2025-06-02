import { config } from 'dotenv';
import type { BootstrapperInterface, EnvVariablesResolver } from '#/types';
import type { Application } from '#application/application';

export default class LoadEnvironmentVariables implements BootstrapperInterface {
  public constructor(
    protected readonly _envVariablesResolver: EnvVariablesResolver,
  ) {
    //
  }

  public async bootstrap(app: Application): Promise<void> {
    config({
      path: app.path.resolve('.env'),
    });

    const { Env } = await this._envVariablesResolver();

    const nodeEnv = Object.hasOwn(Env, 'NODE_ENV')
      ? Env.NODE_ENV
      : process.env.NODE_ENV;

    if (nodeEnv) {
      app.setEnvionment(String(nodeEnv));
    }
  }
}
