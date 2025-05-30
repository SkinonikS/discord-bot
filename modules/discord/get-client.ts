import { Application } from '#core/application/application';
import { Client } from 'discord.js';

export const getDiscordClient = (app?: Application): Client => {
  app ??= Application.getInstance();
  return app.container.get<Client>('Discord.Client');
};
