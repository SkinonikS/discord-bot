import type { Application } from '@framework/core/app';
import type { transport as Transport } from 'winston';

export interface TransportFactoryCreateOptions {
  module: string;
}

export interface TransportFactoryInterface {
  create(app: Application, options: TransportFactoryCreateOptions): Promise<Transport> | Transport;
}

export interface LoggerConfig {
  label: string;
  defaultMeta: Record<string, string>;
  showStackTraces: boolean;
  level: 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'emergency';
  transports: TransportFactoryInterface[];
}
