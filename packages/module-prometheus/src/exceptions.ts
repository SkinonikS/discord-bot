import { RuntimeException } from '@framework/core/vendors/exceptions';

export class UnsupportedMetricTypeException extends RuntimeException {
  public static readonly code = 'UnsupportedMetricType';
  public static readonly status = 500;

  public constructor(
    public readonly type: string,
    cause?: unknown,
  ) {
    super(`Unsupported metric type: ${type}`, { cause });
  }
}
