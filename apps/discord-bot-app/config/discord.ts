import { defineDiscordConfig } from '@package/module-discord-client';
import { IntentsBitField } from 'discord.js';
import { Env } from '#bootstrap/env';

export default defineDiscordConfig({
  token: Env.DISCORD_TOKEN,
  intents: new IntentsBitField([
    'Guilds',
    'GuildMessages',
    'GuildVoiceStates',
  ]),
});
