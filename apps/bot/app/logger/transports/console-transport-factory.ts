import type { TransportFactoryInterface } from '@module/logger';
import type { transport as Transport } from 'winston';

export default class ConsoleTransportFactory implements TransportFactoryInterface {
  public async create(app, { module }): Promise<Transport> {
    const winston = await import('winston');

    return new winston.transports.Console({
      format: winston.format.combine(
        winston.format.label({ label: module }),
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ label, level, message, timestamp, stack }) => {
          return `${timestamp} [${label}] ${level}: ${message}${stack ? `\n${stack}` : ''}`;
        }),
      ),
    });
  }
}
