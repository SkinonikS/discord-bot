import type { Application } from '@framework/core/app';
import type { TransportFactoryCreateOptions, TransportFactoryInterface } from '@module/logger/config';
import type { StreamTransport } from '@module/logger/vendors/winstion';

export interface LokiTransportFactoryConfig {
  host: string;
  label: string;
}

export default class LokiTransportFactory implements TransportFactoryInterface {
  public constructor(protected readonly _config: LokiTransportFactoryConfig) { }

  public async create(app: Application, { module }: TransportFactoryCreateOptions): Promise<StreamTransport> {
    const { default: WinstonLoki } = await import('winston-loki');
    const winston = await import('@module/logger/vendors/winstion');

    const transport = new WinstonLoki({
      host: this._config.host,
      labels: {
        app: this._config.label,
        module,
      },
      format: winston.format.json(),
      json: true,
      replaceTimestamp: true,
      gracefulShutdown: false,
      batching: true,
      clearOnError: true,
      onConnectionError: () => {
        transport.close?.();
      },
    });

    app.onShutdown(() => transport.close?.());
    return transport;
  }
}
