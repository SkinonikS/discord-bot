import type { Application } from '@framework/core/app';
import type { TransportTargetOptions } from 'pino';
import type { PinoLoggerDriverConfig } from '#src/config/logger-drivers/pino-logger-driver';

export interface TransportFactoryInterface {
  create(app: Application, config: Omit<PinoLoggerDriverConfig, 'transports'>): TransportTargetOptions;
}
