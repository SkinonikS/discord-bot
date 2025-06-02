import type { BaseConfig } from '#/types';

export const defineBaseConfig = <T extends Record<string, unknown>>(key: string, config: T): BaseConfig<T> => {
  return { key, config };
};
