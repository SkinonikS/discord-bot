import type { LoggerInterface } from '@module/logger';
import { onExit } from 'signal-exit';
import type Application from '#/application';
import debug from '#/debug';
import ErrorHandler from '#/error-handler';
import type { BootstrapperInterface } from '#/types';

declare module '@framework/core' {
  interface ContainerBindings {
    errorHandler: ErrorHandler;
  }
}

export default class HandleErrorsBootstrapper implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void> {
    const errorHandler = new ErrorHandler(app);
    app.container.bindValue('errorHandler', errorHandler);

    onExit(() => {
      this._shutdown(app).finally(() => process.exit(0));
      return true;
    });

    process.on('uncaughtException', (error) => {
      this._handleError(app, errorHandler, error).finally(() => process.exit(1));
    });

    process.on('unhandledRejection', (reason) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this._handleError(app, errorHandler, error).finally(() => process.exit(1));
    });
  }

  protected async _shutdown(app: Application): Promise<void> {
    if (app.isStarted && ! app.isShuttingDown) {
      await app.shutdown();
    }
  }

  protected async _handleError(app: Application, errorHandler: ErrorHandler, error: Error): Promise<void> {
    debug('Unhandled error:', error);
    await errorHandler.handle(error);
  }
}
