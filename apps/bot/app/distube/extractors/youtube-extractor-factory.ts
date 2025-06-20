import type { ExtractorFactoryInterface } from '@module/distube';
import type { ExtractorPlugin } from 'distube';

export default class YouTubeExtractorFactory implements ExtractorFactoryInterface {
  public async create(): Promise<ExtractorPlugin> {
    const { YouTubePlugin } = await import('@distube/youtube');
    return new YouTubePlugin();
  }
}
