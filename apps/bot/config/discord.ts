import { defineDiscordConfig } from '@module/discord';
import { ActivityType } from 'discord.js';
import { IntentsBitField } from 'discord.js';
import { Env } from '#bootstrap/env';

export default defineDiscordConfig({
  token: Env.DISCORD_TOKEN,
  intents: new IntentsBitField([
    'Guilds',
    'GuildMessages',
    'GuildVoiceStates',
    'DirectMessages',
  ]),
  richPresence: {
    afk: false,
    status: 'online',
    activities: [{
      name: 'with the code',
      type: ActivityType.Streaming,
      state: 'Development',
      url: 'https://github.com/SkinonikS/discord-bot',
    }],
  },
});
