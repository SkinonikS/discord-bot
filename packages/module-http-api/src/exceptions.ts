import { FatalErrorException } from '@framework/core/app';

export class PortAlreadyInUseException extends FatalErrorException {
  public static readonly code = 'PortAlreadyInUse';
  public static readonly status = 500;

  public constructor(
    protected readonly port: number,
    protected readonly address: string = 'localhost',
    cause?: unknown,
  ) {
    super(`Port ${port} is already in use on ${address}`, { cause });
  }
}

export class PortAccessDeniedException extends FatalErrorException {
  public static readonly code = 'PortAccessDenied';
  public static readonly status = 500;

  public constructor(
    protected readonly port: number,
    protected readonly address: string = 'localhost',
    cause?: unknown,
  ) {
    super(`Cannot listen on port ${port} on ${address}`, { cause });
  }
}

export class DNSLookupException extends FatalErrorException {
  public static readonly code = 'DNSLookup';
  public static readonly status = 500;

  public constructor(
    protected readonly hostname: string,
    cause?: unknown,
  ) {
    super(`DNS lookup failed for ${hostname}`, { cause });
  }
}
