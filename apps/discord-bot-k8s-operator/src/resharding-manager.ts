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

    const timeoutId = setTimeout(async () => {
      await callback(watchObject);
    }, this._normalizeInterval(interval));

    this._reshardIntervals.set(watchObject.metadata.uid, timeoutId);
    return ok();
  }

  public stopInterval(watchObject: WatchObject): boolean {
    const interval = this._reshardIntervals.get(watchObject.metadata.uid);

    if (interval) {
      clearTimeout(interval);
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

    const milliseconds = parseDuration(interval);
    if (! milliseconds) {
      const parsed = parseInt(interval, 10);
      return isNaN(parsed) ? this._fallbackInterval : parsed;
    }

    return milliseconds;
  }
}
