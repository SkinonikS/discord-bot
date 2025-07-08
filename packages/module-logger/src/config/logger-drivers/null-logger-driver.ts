import type { LoggerDriverInterface } from '#src/config/types';
import NullLogger from '#src/null-logger';
import type { LoggerInterface } from '#src/types';

export default class NullLoggerDriver implements LoggerDriverInterface {
  public create(): LoggerInterface {
    return new NullLogger();
  }
}
