import { SoundCloudPlugin } from '@distube/soundcloud';
import { YouTubePlugin } from '@distube/youtube';
import { defineDistubeConfig } from '@module/distube';
import { Env } from '#/bootstrap/env';

export default defineDistubeConfig({
  nsfw: Env.DISTUBE_NSFW,
  ffmpegPath: Env.DISTUBE_FFMPEG_PATH,
  plugins: [
    new YouTubePlugin(),
    new SoundCloudPlugin(),
  ],
});
