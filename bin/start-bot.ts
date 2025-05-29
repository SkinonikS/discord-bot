import { Application } from '#core/application/application';
import { ConfigRepository } from '#core/application/config/config-repository';
import { DiscordConfig } from '#modules/discord/types';
import { Client } from 'discord.js';
import kernel from '#bootstrap/kernel';
import debug from '#core/debug';

void kernel.run((app: Application) => {
  debug('Starting Discord bot...');

  const discord = app.container.get<Client>('Discord.Client');
  const config = app.container.get<ConfigRepository>('Config').get<DiscordConfig>('discord');

  void discord.login(config.token);

  return () => discord.destroy();
});
