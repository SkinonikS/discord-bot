import { Application } from '#core/application/application';
import { BootstrapperInterface } from '#core/kernel/types';
import { config } from 'dotenv';

export default class LoadEnvironmentVariables implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void> {
    config({
      path: app.path.resolve('.env'),
    });

    const { Env } = await import('#bootstrap/env');

    const nodeEnv = Object.hasOwn(Env, 'NODE_ENV')
      ? Env.NODE_ENV
      : process.env.NODE_ENV;

    if (nodeEnv) {
      app.setEnvionment(nodeEnv);
    }
  }
}
