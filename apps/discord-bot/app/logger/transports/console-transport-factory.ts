import type { Application } from '@framework/core/app';
import type { TransportFactoryCreateOptions, TransportFactoryInterface } from '@module/logger/config';
import type { StreamTransport } from '@module/logger/vendors/winstion';

export default class ConsoleTransportFactory implements TransportFactoryInterface {
  public async create(_: Application, { module }: TransportFactoryCreateOptions): Promise<StreamTransport> {
    const winston = await import('@module/logger/vendors/winstion');

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
