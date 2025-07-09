import { RuntimeException } from '@framework/core/vendors/exceptions';

export class UnsupportedMetricTypeException extends RuntimeException {
  public constructor(public readonly type: string) {
    super(`Unsupported metric type: ${type}`);
  }
}
