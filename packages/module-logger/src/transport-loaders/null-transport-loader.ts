import type TransportStream from 'winston-transport';
import type { TransportLoaderInterface } from '#/types';

export default class NullTransportLoader implements TransportLoaderInterface {
  public async load(): Promise<TransportStream[]> {
    return [];
  }
}
