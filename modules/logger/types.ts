export interface LoggerInterface {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string | Error, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  notice(message: string, ...args: unknown[]): void;
  critical(message: string, ...args: unknown[]): void;
  emergency(message: string, ...args: unknown[]): void;
}

export interface LoggerFactoryInterface {
  createLogSource(source: string): LoggerInterface;
}
