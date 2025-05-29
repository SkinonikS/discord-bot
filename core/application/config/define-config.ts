import { DefineConfigResult } from '#core/application/types';

export const defineConfig = <T>(key: string, config: T): DefineConfigResult<T> => {
  return { key, config };
};
