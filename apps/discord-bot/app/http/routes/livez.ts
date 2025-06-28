import { defineEventHandler, setResponseStatus } from 'h3';

export default defineEventHandler(async (event) => {
  const discord = await event.context.container.make('discord.client');

  if (! discord.isReady()) {
    setResponseStatus(event, 503);
    return 'not ok';
  }

  setResponseStatus(event, 200);
  return 'ok';
});
