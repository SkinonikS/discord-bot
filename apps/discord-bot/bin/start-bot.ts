import { debug } from '#/debug';
import kernel from '#start/kernel';

void kernel.run(async (app) => {
  const http = await app.container.make('http.api.server');
  const discord = await app.container.make('discord.client');
  const config = (await app.container.make('config')).get('discord');

  http.listen(3000, () => {
    debug('Starting Discord bot...');
    void discord.login(config.token);
  });

  return () => {
    debug('Stopping Discord bot...');
    http.close(() => void discord.destroy());
  };
});
