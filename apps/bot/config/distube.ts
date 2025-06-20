import { defineDistubeConfig } from '@module/distube';
import SoundCloudExtractorFactory from '#/app/distube/extractors/soundcloud-extractor-factory';
import YouTubeExtractorFactory from '#/app/distube/extractors/youtube-extractor-factory';
import { Env } from '#/bootstrap/env';

export default defineDistubeConfig({
  nsfw: Env.DISTUBE_NSFW,
  ffmpeg: {
    path: Env.DISTUBE_FFMPEG_PATH,
  },
  plugins: [
    new YouTubeExtractorFactory(),
    new SoundCloudExtractorFactory(),
  ],
});
