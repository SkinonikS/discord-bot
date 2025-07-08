export interface LoggerInterface {
  info(message: string | Error, ...args: unknown[]): void;
  info(object: object, message?: string, ...args: unknown[]): void;

  warn(message: string | Error, ...args: unknown[]): void;
  warn(object: object, message?: string, ...args: unknown[]): void;

  error(message: string | Error, ...args: unknown[]): void;
  error(object: object, message?: string, ...args: unknown[]): void;

  debug(message: string | Error, ...args: unknown[]): void;
  debug(object: object, message?: string, ...args: unknown[]): void;

  fatal(message: string | Error, ...args: unknown[]): void;
  fatal(object: object, message?: string, ...args: unknown[]): void;

  copy(label: string): LoggerInterface;
}
