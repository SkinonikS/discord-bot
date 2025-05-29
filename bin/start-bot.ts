import { Application } from '#core/application/application';
import { ConfigRepository } from '#core/application/config/config-repository';
import { Kernel } from '#core/kernel/kernel';
import { DiscordConfig } from '#modules/discord/types';
import { Client } from 'discord.js';
import path from 'node:path';

const app = new Application(
  path.resolve(import.meta.dirname, '..'),
);

await app.registerServiceProvider([
  () => import('#core/application/logger/service-provider'),
]);

const kernel = new Kernel(app);

kernel.use([
  () => import('#core/kernel/bootstrappers/load-environment-variables'),
  () => import('#core/kernel/bootstrappers/load-configuration'),
  () => import('#core/kernel/bootstrappers/register-service-providers'),
  () => import('#core/kernel/bootstrappers/boot-service-providers'),
]);

await kernel.run((app: Application) => {
  const discord = app.container.get<Client>('Discord.Client');
  const config = app.container.get<ConfigRepository>('Config').get<DiscordConfig>('discord');

  void discord.login(config.token);

  return () => discord.destroy();
});
