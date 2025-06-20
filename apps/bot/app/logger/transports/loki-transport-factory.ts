import type { TransportFactoryInterface } from '@module/logger';
import type { transport as Transport } from 'winston';

export interface LokiTransportFactoryConfig {
  host: string;
  label: string;
}

export default class LokiTransportFactory implements TransportFactoryInterface {
  public constructor(protected readonly _config: LokiTransportFactoryConfig) { }

  public async create(app, { module }): Promise<Transport> {
    const { default: WinstonLoki } = await import('winston-loki');
    const winston = await import('winston');

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
        transport.close();
      },
    });

    app.onShutdown(() => transport.close());
    return transport;
  }
}
