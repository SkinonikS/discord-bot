import { ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { GatewayInfo, GatwayInfoProviderInterface } from '#/types';

export default class ManualGatewayInfoProvider implements GatwayInfoProviderInterface {
  public constructor(
    protected _shards: number = 1,
    protected _maxConcurrency: number = 1,
  ) { }

  public async fetchInfo(): Promise<Result<GatewayInfo, Error>>  {
    return ok({
      shards: this._shards,
      sessionStartLimit: {
        total: Infinity,
        remaining: Infinity,
        resetAfter: Infinity,
        maxConcurrency: this._maxConcurrency,
      },
    });
  }
}
