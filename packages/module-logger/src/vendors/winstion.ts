import * as winston from 'winston';

export const createLogger = winston.createLogger;
export const format = winston.format;
export const transports = winston.transports;

export type StreamTransport = winston.transport;
export type Logger = winston.Logger;
