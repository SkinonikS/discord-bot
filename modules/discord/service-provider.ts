import { Application } from '#core/application/application';
import { ConfigRepository } from '#core/application/config/config-repository';
import { ServiceProviderInterface } from '#core/application/types';
import { DiscordConfig } from '#modules/discord/types';
import { createLogger } from '#modules/logger/create-logger';
import { Client } from 'discord.js';

export default class DiscordServiceProvider implements ServiceProviderInterface{
  protected readonly _logger = createLogger('Discord');

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.bind('Discord.Client').toDynamicValue((ctx) => {
      const config = ctx
        .get<ConfigRepository>('Config')
        .get<DiscordConfig>('discord');

      const client = new Client({
        intents: config.intents,
      });

      client.once('ready', (client) => {
        this._logger.info(`Discord client is ready as ${client.user.tag}`);
      });

      client.on('error', (error) => {
        this._logger.error('Discord client encountered an error:', error);
      });

      return client;
    }).inSingletonScope();
  }

  public name(): string {
    return 'DISCORD';
  }
}
