import type { Application, ConfigRepository, ServiceProviderInterface } from '@package/framework';
import { createLogSource, type LoggerInterface } from '@package/module-logger';
import { Client, Events } from 'discord.js';
import type { DiscordConfig } from '#/types';

declare module '@package/framework' {
  interface ContainerBindings {
    'discord.client': Client;
  }

  interface ConfigBindings {
    'discord': DiscordConfig;
  }
}

export default class DiscordServiceProvider implements ServiceProviderInterface {
  protected declare _logger: LoggerInterface;

  public constructor(protected readonly _app: Application) { }

  public register(): void {
    this._app.container.singleton('discord.client', async (container) => {
      const config = await container.make('config') as ConfigRepository;
      const discordConfig = config.get('discord');

      if (! discordConfig) {
        this._logger.critical(new Error('Discord configuration is missing. Maybe you forgot to add it into `bootstrap/kernel.ts`?'));
        process.exit(1);
      }

      const client = new Client({
        intents: discordConfig.intents,
      });

      client.once(Events.ShardReady, (shardId) => {
        this._logger.info(`Shard ${String(shardId)} is ready`);
      });

      client.once(Events.ShardDisconnect, (event, shardId) => {
        this._logger.warn(`Shard ${String(shardId)} disconnected: ${event.code}`);
      });

      client.once(Events.ClientReady, (client) => {
        this._logger.info(`Discord client is ready as ${client.user.tag}`);
      });

      client.on(Events.Error, (error) => {
        this._logger.error('Discord client encountered an error:', error);
      });

      return client;
    });
  }

  public async boot(): Promise<void> {
    this._logger = await createLogSource('Discord');
  }
}
