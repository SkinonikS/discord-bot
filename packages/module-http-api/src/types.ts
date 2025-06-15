import type { Application } from '@framework/core';
import type { EventHandler } from 'h3';

export interface HttpApiConfig {
  port: number;
  host: string;
  routes: RouteLoaderInterface;
}

export interface RouteLoaderInterface {
  load(app: Application): Promise<EventHandler[]>;
}
