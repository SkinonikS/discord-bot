import type { DisTubePlugin } from 'distube';

export type DisTubeConfig = {
  nsfw: boolean;
  plugins: DisTubePlugin[];
  ffmpegPath?: string;
};
