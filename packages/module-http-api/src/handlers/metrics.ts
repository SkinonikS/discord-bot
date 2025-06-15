import { defineEventHandler, setResponseHeader } from 'h3';
import type { Registry } from 'prom-client';

export default defineEventHandler(async (event) => {
  const registery: Registry = await event.context.container.make('prometheus');
  setResponseHeader(event, 'Content-Type', registery.contentType);
  return registery.metrics();
});
