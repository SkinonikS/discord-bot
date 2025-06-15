import { Application, defineBaseConfig, type BaseConfig } from '@framework/core';
import type DisTube from 'distube';
import type { DisTubeConfig } from './types';

export const getDistube = (app?: Application): Promise<DisTube> => {
  app = app ?? Application.getInstance();
  return app.container.make('distube');
};

export const defineDistubeConfig = (config: Partial<DisTubeConfig>): BaseConfig<DisTubeConfig> => defineBaseConfig('distube', {
  nsfw: config.nsfw ?? false,
  plugins: config.plugins ?? [],
  ffmpegPath: config.ffmpegPath,
});
