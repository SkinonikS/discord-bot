import { defineEventHandler, setResponseHeader } from 'h3';

export default defineEventHandler(async (event) => {
  const registery = await event.context.container.make('prometheus');
  setResponseHeader(event, 'Content-Type', registery.contentType);
  return registery.metrics();
});
