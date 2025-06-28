import { Application } from '@framework/core/app';
import type { Client } from 'discord.js';

export const getDiscordClient = async (app?: Application): Promise<Client> => {
  app ??= Application.getInstance();
  return app.container.make('discord.client');
};
