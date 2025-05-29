import { IntentsBitField } from 'discord.js';

export interface DiscordConfig extends Record<string, unknown> {
  token: string;
  intents: IntentsBitField;
}
