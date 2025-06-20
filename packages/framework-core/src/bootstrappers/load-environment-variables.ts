import fs from 'node:fs';
import { config } from 'dotenv';
import type Application from '#/application';
import debug from '#/debug';
import type { BootstrapperInterface, EnvVariablesResolver } from '#/types';

export default class LoadEnvironmentVariablesBootstrapper implements BootstrapperInterface {
  public constructor(
    protected readonly _envVariablesResolver: EnvVariablesResolver,
  ) {
    //
  }

  public async bootstrap(app: Application): Promise<void> {
    const envFile = app.path.resolve('.env');

    if (fs.existsSync(envFile)) {
      config({ path: envFile });
      debug(`Loaded environment variables from ${envFile}`);
    } else {
      debug('No .env file found, skipping environment variables loading');
    }

    const { Env } = await this._envVariablesResolver();

    if (Object.hasOwn(Env, 'NODE_ENV')) {
      app.setEnvionment(String(Env.NODE_ENV));
    }
  }
}
