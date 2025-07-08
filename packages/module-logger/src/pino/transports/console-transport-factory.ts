import path from 'path';
import type { Application } from '@framework/core/app';
import type { TransportTargetOptions } from 'pino';
import type { PinoLoggerDriverConfig } from '#src/config/logger-drivers/pino-logger-driver';
import type { TransportFactoryInterface } from '#src/pino/types';


export default class ConsoleTransportFactory implements TransportFactoryInterface {
  public create(_: Application, config: Omit<PinoLoggerDriverConfig, 'transports'>): TransportTargetOptions {
    return {
      target: path.resolve(import.meta.dirname, 'pino-pretty'),
      options: {
        stackTraces: config.stackTraces,
        colorize: true,
        translateTime: 'HH:MM:ss.l',
        singleLine: true,
      },
    };
  }
}
