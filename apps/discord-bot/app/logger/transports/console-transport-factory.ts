import type { Application } from '@framework/core/app';
import type { TransportFactoryCreateOptions, TransportFactoryInterface } from '@module/logger/config';
import type { transport as Transport } from 'winston';

export default class ConsoleTransportFactory implements TransportFactoryInterface {
  public async create(_: Application, { module }: TransportFactoryCreateOptions): Promise<Transport> {
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
