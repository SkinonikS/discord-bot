import { Application } from '#core/application/application';
import { BootstrapperInterface } from '#core/kernel/types';
import { config } from 'dotenv';

export default class LoadEnvironmentVariables implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void> {
    config({
      path: app.path.resolve('.env'),
    });

    // Ensure that the environment variables are loaded before any other bootstrapper
    await import('#bootstrap/env');

    // Set the environment in the application
    if (process.env.NODE_ENV) {
      app.setEnvionment(process.env.NODE_ENV);
    }
  }
}
