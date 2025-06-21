import path from 'path';
import { Application } from '@framework/core';
import { SimpleEvent } from '@framework/core/workers';
import pkg from '../../package.json';
import { createKernel } from '#start/kernel';
import 'reflect-metadata';

const app = new Application({
  appRoot: path.resolve(import.meta.dirname, '..', '..'),
  version: pkg.version,
  environment: 'development',
});
Application.setInstance(app);

const kernel = await createKernel(app, {
  configFiles: [
    () => import('#config/logger'),
    () => import('#config/discord'),
    () => import('#config/slash-commands'),
  ],
  modules: [
    () => import('@module/discord/module'),
    () => import('@module/slash-commands/module'),
  ],
});

void kernel.run(async (app) => {
  await app.start();

  const discord = await app.container.make('discord.client');
  discord.on('ready', (client) => {
    if (process.send) {
      process.send(new SimpleEvent('ready', { user: client.user.id }));
    }
  });
});
