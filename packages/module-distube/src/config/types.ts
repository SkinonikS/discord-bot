import type { Application } from '@framework/core/app';
import type { ExtractorPlugin } from 'distube';

export interface DisTubeConfig {
  nsfw: boolean;
  plugins: ExtractorFactoryInterface[];
  ffmpeg?: {
    path?: string;
  };
}

export interface ExtractorFactoryInterface {
  create(app: Application): Promise<ExtractorPlugin> | ExtractorPlugin;
}
