import type { Result } from '@framework/core/vendors/neverthrow';
import { err, fromPromise, ok } from '@framework/core/vendors/neverthrow';
import { GuildMember, MessageFlags, SlashCommandBuilder } from '@module/discord/vendors/discordjs';
import type { ChatInputCommandInteraction } from '@module/discord/vendors/discordjs';
import type { DisTubeError, DisTube } from '@module/distube/vendors/distube';
import type { SlashCommandInterface  } from '@module/slash-commands';

// Just a simple command to test the music functionality of the bot.
// Will be changed later.
export default class MusicCommand implements SlashCommandInterface {
  static containerInjections = {
    _constructor: {
      dependencies: ['distube'],
    },
  };

  public readonly name = 'music';

  public constructor(
    protected readonly _distube: DisTube,
  ) { }

  public get metadata(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder();

    builder
      .setName(this.name)
      .setDescription('Music-related commands')
      .addSubcommand((subcommand) => subcommand
        .setName('play')
        .setDescription('Add a song or playlist to the current queue.')
        .addStringOption(option =>
          option.setName('query')
            .setDescription('The name or URL of the song/playlist.')
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
      )
      .addSubcommand((subcommand) => subcommand
        .setName('volume')
        .setDescription('Change the volume of the music.')
        .addIntegerOption((option) => option
          .setName('level')
          .setDescription('Volume level (1-100%).')
          .setRequired(true),
        ),
      );

    return builder;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<Result<void, Error>> {
    const deferReply = await interaction.deferReply({
      flags: MessageFlags.Ephemeral,
    });

    if (! interaction.inGuild()) {
      await deferReply.edit('This command can only be used in servers!');
      return ok();
    }

    if (! (interaction.member instanceof GuildMember)) {
      return ok();
    }

    if (! interaction.member.voice.channel) {
      deferReply.edit('You must be in a voice channel to use music commands!');
      return ok();
    }

    const queue = this._distube.getQueue(interaction.guildId);

    if (! interaction.member.voice.channel.joinable) {
      await deferReply.edit('I cannot join your voice channel. Please check my permissions.');
      return ok();
    }

    if (queue && queue.voice.channel.id !== interaction.member.voice.channel.id) {
      await deferReply.edit('You must be in the same voice channel as the bot to use music commands!');
      return ok();
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'play': {
        const query = interaction.options.getString('query', true);

        const playResult = await fromPromise<unknown, DisTubeError | Error>(this._distube.play(interaction.member.voice.channel, query, {
          textChannel: interaction.channel ?? undefined,
          member: interaction.member,
        }), (error) => {
          if (! (error instanceof Error)) {
            return new Error('An unknown error occurred while trying to play the song.');
          }

          return error;
        });

        if (playResult.isErr()) {
          await deferReply.edit('Error while trying to play the song.');
          return err(playResult.error);
        }

        await deferReply.edit(`Playing: ${query}`);
        break;
      }
      case 'pause': {
        if (! queue) {
          await deferReply.edit('There is nothing playing to pause!');
          return ok();
        }

        await queue.pause();
        await deferReply.edit('⏸️ Paused the music.');
        break;
      }
      case 'resume': {
        if (! queue) {
          await deferReply.edit('There is nothing paused to resume!');
          return ok();
        }

        await queue.resume();
        await deferReply.edit('▶️ Resumed the music.');
        break;
      }
      case 'skip': {
        if (! queue) {
          await deferReply.edit('There is nothing playing to skip!');
          return ok();
        }

        await queue.skip();
        await deferReply.edit('Skipped the song.');
        break;
      }
      case 'stop': {
        if (! queue) {
          await deferReply.edit('There is no music playing to stop!');
          return ok();
        }

        await queue.stop();
        await deferReply.edit('Stopped the music and cleared the queue.');
        break;
      }
      case 'queue': {
        if (! queue) {
          deferReply.edit('The queue is empty!');
          return ok();
        }

        const queueString = queue.songs.map((song, index) => `${index + 1}. ${song.name} (${song.formattedDuration})`).join('\n');
        await deferReply.edit(`📜 **Music Queue:**\n${queueString}`);
        break;
      }
      case 'volume': {
        const level = interaction.options.getInteger('level', true);
        if (! queue) {
          deferReply.edit('There is no music playing to change the volume!');
          return ok();
        }

        if (level < 1 || level > 100) {
          deferReply.edit('Volume level must be between 1 and 100!');
          return ok();
        }

        await queue.setVolume(level);
        await deferReply.edit(`🔊 Changed the volume to ${level}%.`);
        break;
      }
      default: {
        await deferReply.edit('Unknown subcommand. Please use a valid music command.');
        return ok();
      }
    }

    return ok();
  }
}
