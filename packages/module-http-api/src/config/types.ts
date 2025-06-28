import type { EventHandler } from 'h3';

export type EventHandlerResolver = () => Promise<{ default: EventHandler }> | Promise<EventHandler>;
export interface HttpApiConfig {
  port: number;
  host: string;
  routes: EventHandlerResolver[];
}
