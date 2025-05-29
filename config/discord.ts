import { Env } from '#bootstrap/env';
import { defineConfig } from '#modules/discord/define-config';
import { IntentsBitField } from 'discord.js';

export default defineConfig({
  token: Env.DISCORD_TOKEN,
  intents: new IntentsBitField([
    'Guilds',
    'GuildMessages',
  ]),
});
