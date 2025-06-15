import type { LoggerInterface } from '@module/logger';
import type { SlashCommandInterface } from '@module/slash-commands';
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder, GuildMember } from 'discord.js';
import { DisTube, DisTubeError } from 'distube';

export default class MusicCommand implements SlashCommandInterface {
  static containerInjections = {
    _constructor: {
      dependencies: [DisTube, 'logger'],
    },
  };

  public readonly name = 'music';
  public readonly cooldown = 5;

  public constructor(
    protected readonly _distube: DisTube,
    protected readonly _logger: LoggerInterface,
  ) { }

  public build(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder();

    builder
      .setName(this.name)
      .setDescription('Music-related commands')
      .addSubcommand((subcommand) => subcommand
        .setName('play')
        .setDescription('Add a song or playlist to the current queue.')
        .addStringOption(option =>
          option.setName('url')
            .setDescription('The URL of the song or playlist.')
            .setRequired(true)),
      )
      .addSubcommand((subcommand) => subcommand
        .setName('pause')
        .setDescription('Pause the current song.'),
      )
      .addSubcommand((subcommand) => subcommand
        .setName('resume')
        .setDescription('Resume the paused song.'))
      .addSubcommand((subcommand) => subcommand
        .setName('skip')
        .setDescription('Skip the current song.'),
      )
      .addSubcommand((subcommand) => subcommand
        .setName('stop')
        .setDescription('Stop the music and clear the queue.'),
      )
      .addSubcommand((subcommand) => subcommand
        .setName('queue')
        .setDescription('View the current music queue.'),
      );

    return builder;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const deferReply = await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    if (! interaction.inGuild()) {
      await deferReply.edit('This command can only be used in servers!');
      return;
    }

    if (! (interaction.member instanceof GuildMember)) {
      return;
    }

    if (! interaction.member.voice.channel) {
      deferReply.edit('You must be in a voice channel to use music commands!');
      return;
    }

    const queue = this._distube.getQueue(interaction.guildId);

    if (! interaction.member.voice.channel.joinable) {
      await deferReply.edit('I cannot join your voice channel. Please check my permissions.');
      return;
    }

    if (queue && queue.voice.channel.id !== interaction.member.voice.channel.id) {
      await deferReply.edit('You must be in the same voice channel as the bot to use music commands!');
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'play': {
        const url = interaction.options.getString('url', true);

        try {
          await this._distube.play(interaction.member.voice.channel, url, {
            textChannel: interaction.channel ?? undefined,
            member: interaction.member,
          });

        } catch (e) {
          let message: string;
          if (! (e instanceof DisTubeError)) {
            message = 'An unexpected error occurred while trying to play the music.';
          } else {
            message = e.message;
          }

          this._logger.error(message);
          await deferReply.edit(message);
        }

        let name: string;
        if (queue) {
          const song = queue.songs[0];
          name = `${song?.name} (${song.formattedDuration})`;
        } else {
          name = url;
        }

        await deferReply.edit(`🎵 Add: ${name}`);
        break;
      }
      case 'pause': {
        if (! queue) {
          await deferReply.edit('There is nothing playing to pause!');
          return;
        }

        await queue.pause();
        await deferReply.edit('⏸️ Paused the music.');
        break;
      }
      case 'resume': {
        if (! queue) {
          await deferReply.edit('There is nothing paused to resume!');
          return;
        }

        await queue.resume();
        await deferReply.edit('▶️ Resumed the music.');
        break;
      }
      case 'skip': {
        if (! queue) {
          await deferReply.edit('There is nothing playing to skip!');
          return;
        }

        await queue.skip();
        await deferReply.edit('⏩ Skipped the song.');
        break;
      }
      case 'stop': {
        if (! queue) {
          await deferReply.edit('There is no music playing to stop!');
          return;
        }

        await queue.stop();
        await deferReply.edit('⛔ Stopped the music and cleared the queue.');
        break;
      }
      case 'queue': {
        if (! queue) {
          deferReply.edit('The queue is empty!');
          return;
        }
        const queueString = queue.songs.map((song, index) => `${index + 1}. ${song.name} (${song.formattedDuration})`).join('\n');
        await deferReply.edit(`📜 **Music Queue:**\n${queueString}`);
        break;
      }
      default: {
        await deferReply.edit('Unknown subcommand. Please use a valid music command.');
        return;
      }
    }
  }
}
