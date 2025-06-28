import { defineBaseConfig } from '@framework/core/config';
import type { BaseConfig } from '@framework/core/config';
import type { DisTubeConfig } from '#src/config/types';

export const defineDistubeConfig = (config: Partial<DisTubeConfig>): BaseConfig<DisTubeConfig> => defineBaseConfig('distube', {
  nsfw: config.nsfw ?? false,
  plugins: config.plugins ?? [],
  ffmpeg: {
    path: config.ffmpeg?.path,
  },
});
