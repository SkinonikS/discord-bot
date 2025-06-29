import type { ExtractorFactoryInterface } from '@module/distube/config';
import type { ExtractorPlugin } from '@module/distube/vendors/distube';

export default class YouTubeExtractorFactory implements ExtractorFactoryInterface {
  public async create(): Promise<ExtractorPlugin> {
    const { YouTubePlugin } = await import('@distube/youtube');
    return new YouTubePlugin();
  }
}
