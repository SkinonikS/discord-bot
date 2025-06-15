import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import type { VoiceConnection } from '@discordjs/voice';
import { EndBehaviorType, joinVoiceChannel } from '@discordjs/voice';
import { Application } from '@framework/core';
import type { SlashCommandInterface } from '@module/slash-commands';
import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import prism from 'prism-media';

export default class RecordCommand implements SlashCommandInterface {
  static containerInjections = {
    _constructor: {
      dependencies: [Application],
    },
  };

  public readonly name = 'record';
  public readonly cooldown = 5;

  public recordings = new Map<string, { connection: VoiceConnection; ffmpeg: ChildProcessWithoutNullStreams }>();

  public constructor(protected readonly _app: Application) { }

  public build(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder();

    builder.setName('record')
      .setDescription('Control voice recording')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('start')
          .setDescription('Start recording'),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('stop')
          .setDescription('Stop recording'),
      );

    return builder;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (! interaction.inGuild()) {
      await interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'start') {
      const client = interaction.client;
      const member = interaction.member as unknown as GuildMember;
      const channel = member.voice.channel;

      if (! channel) {
        await interaction.reply({ content: 'You must be in a voice channel to start recording.', flags: MessageFlags.Ephemeral });
        return;
      }

      const connection = joinVoiceChannel({
        selfDeaf: false,
        selfMute: true,
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      const filename = this._app.path.resolve('recordings', `${Date.now()}.mp3`);
      const ffmpeg = spawn('ffmpeg', [
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
        '-i', 'pipe:0',
        '-acodec', 'libmp3lame',
        '-ab', '128k',
        filename,
      ]);

      this.recordings.set(interaction.guildId, { connection, ffmpeg });

      connection.receiver.speaking.on('start', (userId) => {
        const user = client.users.cache.get(userId);

        if (! user) {
          return;
        }

        const opusStream = connection.receiver.subscribe(userId, {
          end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 1000,
          },
        });

        const decoder = new prism.opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });
        opusStream.pipe(decoder).pipe(ffmpeg.stdin, { end: false });

        console.log(`Recording ${user.username}`);
      });
    } else if (subcommand === 'stop') {
      const record = this.recordings.get(interaction.guildId);
      if (record) {
        record.connection.destroy();
        record.ffmpeg.stdin.end();
        this.recordings.delete(interaction.guildId);
        await interaction.reply('🛑 Stopped recording and left the voice channel.');
      } else {
        await interaction.reply({ content: 'Not currently recording.', flags: MessageFlags.Ephemeral });
      }
    }
  }
}
