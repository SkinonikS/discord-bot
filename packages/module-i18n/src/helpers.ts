import { Application } from '@framework/core/app';
import type { i18n } from 'i18next';

export const getI18n = (app?: Application): Promise<i18n> => {
  app ??= Application.getInstance();
  return app.container.make('i18n');
};
