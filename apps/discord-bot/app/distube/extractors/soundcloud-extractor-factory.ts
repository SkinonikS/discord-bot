import type { ExtractorFactoryInterface } from '@module/distube/config';
import type { ExtractorPlugin } from 'distube';

export default class SoundCloudExtractorFactory implements ExtractorFactoryInterface {
  public async create(): Promise<ExtractorPlugin> {
    const { SoundCloudPlugin } = await import('@distube/soundcloud');
    return new SoundCloudPlugin();
  }
}
