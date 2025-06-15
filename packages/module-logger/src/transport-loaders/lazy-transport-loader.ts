import type TransportStream from 'winston-transport';
import type { TransportLoaderInterface, TransportLoaderOptions } from '#/types';

export type TransportResolver = (options: TransportLoaderOptions) => Promise<TransportStream> | TransportStream;
export default class LazyTransportLoader implements TransportLoaderInterface {
  public constructor(protected readonly _transports: TransportResolver[]) { }

  public async load(options: TransportLoaderOptions): Promise<TransportStream[]> {
    const transports = this._transports.map((transport) => {
      return transport(options);
    });

    return Promise.all(transports);
  }
}
