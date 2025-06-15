import type { Application } from '@framework/core';
import type { EventHandler } from 'h3';
import type { RouteLoaderInterface } from '#/types';

export type RouteResolver = (app: Application) => Promise<{ default: EventHandler }>;
export default class LazyRouteLoader implements RouteLoaderInterface {
  public constructor(protected readonly _resolvers: RouteResolver[]) { }

  public async load(app: Application): Promise<EventHandler[]> {
    const commands = this._resolvers.map(async (resolver) => {
      const { default: handler } = await resolver(app);
      return handler;
    });

    return Promise.all(commands);
  }
}
