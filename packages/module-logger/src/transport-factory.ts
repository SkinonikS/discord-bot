import type { Application } from '@framework/core';
import { format } from 'winston';
import type TransportStream from 'winston-transport';
import type { BaseTransportConfig, ConsoleTransportConfig, DailyRotateFileTransportConfig, KnownTransports, LoggerConfig, LokiTransportConfig } from '#/types';

export type CustomFactory<K extends keyof KnownTransports> = (app: Application, config: BaseTransportConfig<K>) => Promise<TransportStream> | TransportStream;
export default class TransportFactory {
  protected readonly _customCreators: Record<string, CustomFactory<keyof KnownTransports>> = {};

  public constructor(
    protected readonly _app: Application,
    protected readonly _config: Omit<LoggerConfig, 'transports'>,
  ) { }

  public async create<K extends keyof KnownTransports>(config: BaseTransportConfig<K>): Promise<TransportStream> {
    if (this._customCreators[config.driver]) {
      return this._customCreators[config.driver](this._app, config);
    }

    const methodName = `_create${config.driver.charAt(0).toUpperCase()}${config.driver.slice(1)}Transport`;

    if (typeof (this as any)[methodName] === 'function') {
      return (this as any)[methodName](config);
    }

    throw new Error(`Transport factory for driver "${config.driver}" not found.`);
  }

  public extend<K extends keyof KnownTransports>(driver: K, factory: CustomFactory<K>): this {
    this._customCreators[driver] = factory;
    return this;
  }

  protected async _createDailyRotateFileTransport(config: DailyRotateFileTransportConfig): Promise<TransportStream> {
    const { default: DailyRotateFile } = await import('winston-daily-rotate-file');
    const path = this._app.path.resolve(config.directory);

    return new DailyRotateFile({
      datePattern: config.datePattern,
      zippedArchive: config.zippedArchive,
      maxSize: config.maxSize,
      maxFiles: config.maxFiles,
      filename: config.filename,
      dirname: path,
      extension: '.log',
      auditFile: config.auditFilename,
    });
  }

  protected async _createLokiTransport(config: LokiTransportConfig): Promise<TransportStream> {
    const { default: LokiTransport } = await import('winston-loki');

    return new LokiTransport({
      host: config.host,
      json: true,
      replaceTimestamp: true,
      format: format.json(),
    });
  }

  protected async _createConsoleTransport(config: ConsoleTransportConfig): Promise<TransportStream> {
    const formats = [
      format.timestamp({ format: 'HH:mm:ss' }),
    ];

    if (config.printf) {
      formats.push(format.printf(config.printf));
    } else {
      formats.push(format.simple());
    }

    if (config.colorize) {
      formats.push(format.colorize({ all: true }));
    }

    const { transports: { Console } } = await import('winston');

    return new Console({
      format: format.combine(...formats),
    });
  }
}
