import { type LazyEventHandler } from 'h3';
import type { RouteLoaderInterface } from '#/types';

export default class NullRouteLoader implements RouteLoaderInterface {
  public async load(): Promise<LazyEventHandler[]> {
    return [];
  }
}
