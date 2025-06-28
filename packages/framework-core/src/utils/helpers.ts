import { fromThrowable } from 'neverthrow';
import Application from '#src/app/application';
import type { BaseResolver } from '#src/kernel/types';
import { ImportNotFoundException } from '#src/utils/exceptions';

export const safeJsonParse = fromThrowable(JSON.parse, () => new Error('Invalid JSON format'));

export async function importModule<T = never>(resolver: BaseResolver<T>, ...args: unknown[]): Promise<T> {
  const module = await resolver(...args);

  if (! module) {
    throw new ImportNotFoundException(resolver.name);
  }

  if (module && typeof module === 'object' && 'default' in module) {
    return module.default;
  }

  return module;
}

export const instantiateIfNeeded = async <T>(target: T | (new () => T), app?: Application): Promise<T> => {
  if (target instanceof Function) {
    app ??= Application.getInstance();
    return app.container.make(target);
  }

  return target;
};
