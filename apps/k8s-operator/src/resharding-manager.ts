import { ok, err } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { StartReshardCallback, StartReshardingOptions } from '#/types';

export default class ReshardingManager {
  protected readonly _reshardIntervals: Map<string, NodeJS.Timeout> = new Map();

  public startInterval({ resourceUid, intervalDelay }: StartReshardingOptions, callback: StartReshardCallback): Result<void, Error> {
    if (this._reshardIntervals.has(resourceUid)) {
      return err(new Error(`Resharding interval for resource ${resourceUid} already exists.`));
    }

    const _createInterval = () => setTimeout(async () => {
      this._reshardIntervals.delete(resourceUid);
      await callback(resourceUid);
      this._reshardIntervals.set(resourceUid, _createInterval());
    }, intervalDelay);

    this._reshardIntervals.set(resourceUid, _createInterval());
    return ok();
  }

  public stopInterval(resourceUid: string): boolean {
    const interval = this._reshardIntervals.get(resourceUid);

    if (interval) {
      clearInterval(interval);
      this._reshardIntervals.delete(resourceUid);
      return true;
    }

    return false;
  }

  public hasInterval(resourceUid: string): boolean {
    return this._reshardIntervals.has(resourceUid);
  }
}
