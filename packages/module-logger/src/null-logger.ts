import type { LoggerInterface } from '#src/types';

export default class NullLogger implements LoggerInterface {
  public info(message: string, ...args: unknown[]): void;
  public info(object: unknown, message?: string, ...args: unknown[]): void;
  public info(message: string | object, ...args: unknown[]): void {
    // no-op
  }

  public warn(message: string, ...args: unknown[]): void;
  public warn(object: unknown, message?: string, ...args: unknown[]): void;
  public warn(message: string | object, ...args: unknown[]): void {
    // no-op
  }

  public error(message: string, ...args: unknown[]): void;
  public error(object: unknown, message?: string, ...args: unknown[]): void;
  public error(message: string | object, ...args: unknown[]): void {
    // no-op
  }

  public debug(message: string, ...args: unknown[]): void;
  public debug(object: unknown, message?: string, ...args: unknown[]): void;
  public debug(message: string | object, ...args: unknown[]): void {
    // no-op
  }

  public fatal(message: string, ...args: unknown[]): void;
  public fatal(object: unknown, message?: string, ...args: unknown[]): void;
  public fatal(message: string | object, ...args: unknown[]): void {
    // no-op
  }

  public copy(label: string): LoggerInterface {
    return this;
  }
}
