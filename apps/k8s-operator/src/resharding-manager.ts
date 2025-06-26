import { ok, err } from 'neverthrow';
import type { Result } from 'neverthrow';
import parseDuration from 'parse-duration';
import type { ReshardingManagerInterface, ReshardIntervalCallback, StartReshardingIntervalOptions, WatchObject } from '#/types';

export default class ReshardingManager implements ReshardingManagerInterface{
  protected readonly _reshardIntervals: Map<string, NodeJS.Timeout> = new Map();

  public constructor(
    protected readonly _fallbackInterval = 3600000,
  ) { }

  public startInterval({ watchObject, interval }: StartReshardingIntervalOptions, callback: ReshardIntervalCallback): Result<void, Error> {
    if (this._reshardIntervals.has(watchObject.metadata.uid)) {
      return err(new Error(`Resharding interval for resource '${watchObject.metadata.name}' in namespace '${watchObject.metadata.namespace}' already exists`));
    }

    const _createInterval = () => setTimeout(async () => {
      this._reshardIntervals.delete(watchObject.metadata.uid);
      await callback(watchObject);
      this._reshardIntervals.set(watchObject.metadata.uid, _createInterval());
    }, this._normalizeInterval(interval));

    this._reshardIntervals.set(watchObject.metadata.uid, _createInterval());
    return ok();
  }

  public stopInterval(watchObject: WatchObject): boolean {
    const interval = this._reshardIntervals.get(watchObject.metadata.uid);

    if (interval) {
      clearInterval(interval);
      this._reshardIntervals.delete(watchObject.metadata.uid);
      return true;
    }

    return false;
  }

  public hasInterval(watchObject: WatchObject): boolean {
    return this._reshardIntervals.has(watchObject.metadata.uid);
  }

  protected _normalizeInterval(interval: number | string): number {
    if (typeof interval === 'number') {
      return interval;
    }

    const first = parseInt(interval);
    if (! isNaN(first)) {
      return first;
    }

    const second = parseDuration(interval);
    return second ?? this._fallbackInterval;
  }
}
