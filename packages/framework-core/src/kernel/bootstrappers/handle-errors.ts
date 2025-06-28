import { onExit } from 'signal-exit';
import debug from '#root/debug';
import type Application from '#src/app/application';
import ErrorHandler from '#src/app/error-handler';
import type { BootstrapperInterface } from '#src/kernel/types';

declare module '@framework/core/app' {
  interface ContainerBindings {
    errorHandler: ErrorHandler;
  }
}

export default class HandleErrors implements BootstrapperInterface {
  public async bootstrap(app: Application): Promise<void> {
    const errorHandler = new ErrorHandler(app);
    app.container.bindValue('errorHandler', errorHandler);

    onExit(() => {
      console.trace();
      this._shutdown(app).finally(() => process.exit(0));
      return true;
    });

    process.on('uncaughtException', (error) => {
      console.trace();
      this._handleError(app, errorHandler, error);
    });

    process.on('unhandledRejection', (reason) => {
      console.trace();
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this._handleError(app, errorHandler, error);
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
