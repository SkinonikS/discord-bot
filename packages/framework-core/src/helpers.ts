import Application from '#src/app/application';
import type ConfigRepository from '#src/app/config-repository';
import type ErrorHandler from '#src/app/error-handler';

export const getApplication = (): Application => {
  return Application.getInstance();
};

export const getErrorHandler = (app?: Application): Promise<ErrorHandler> => {
  app ??= Application.getInstance();
  return app.container.make('errorHandler');
};

export const getConfigRepository = async (app?: Application): Promise<ConfigRepository> => {
  app ??= Application.getInstance();
  return app.container.make('config');
};

export async function report(error: Error, app?: Application): Promise<void> {
  const errorHandler = await getErrorHandler(app);
  return errorHandler.report(error);
}
