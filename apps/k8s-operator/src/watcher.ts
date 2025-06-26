import type * as k8s from '@kubernetes/client-node';
import type { Result } from 'neverthrow';
import { fromPromise } from 'neverthrow';
import type { Logger } from 'winston';
import type Cluster from '#/cluster';
import type { WatchObject } from '#/types';

export interface WatcherHandlers {
  onAdded?: (watchObject: WatchObject) => Promise<Result<void, Error>> | Result<void, Error>;
  onModified?: (watchObject: WatchObject) => Promise<Result<void, Error>> | Result<void, Error>;
  onDeleted?: (watchObject: WatchObject) => Promise<Result<void, Error>> | Result<void, Error>;
}

export default class Watcher {
  public constructor(
    protected readonly _watch: k8s.Watch,
    protected readonly _logger: Logger,
    protected readonly _watchUrl: string = '/apis/example.com/v1/discordbots',
  ) {
    //
  }

  public async watchFor(cluster: Cluster): Promise<Result<AbortController, Error>> {
    const watchPromise = this._watch.watch(this._watchUrl, { }, async (phase, watchObject: WatchObject) => {
      if (phase === 'ADDED') {
        const addedResult = await cluster.create(watchObject);

        if (addedResult.isErr()) {
          this._logger.error(`Error handling added Discord bot: ${addedResult.error.message}`);
        } else {
          this._logger.info(`Discord bot added: ${watchObject.metadata.name} in namespace ${watchObject.metadata.namespace}`);
        }
      } else if (phase === 'MODIFIED') {
        const modifiedResult = await cluster.destroy(watchObject)
          .then(() => cluster.create(watchObject));

        if (modifiedResult.isErr()) {
          this._logger.error(`Error handling modified Discord bot: ${modifiedResult.error.message}`);
        } else {
          this._logger.info(`Discord bot modified successfully: ${watchObject.metadata.name} in namespace ${watchObject.metadata.namespace}`);
        }
      } else if (phase === 'DELETED') {
        const deletedResult = await cluster.destroy(watchObject);

        if (deletedResult.isErr()) {
          this._logger.error(`Error handling deleted Discord bot: ${deletedResult.error.message}`);
        } else {
          this._logger.info(`Discord bot deleted successfully: ${watchObject.metadata.name} in namespace ${watchObject.metadata.namespace}`);
        }
      }
    }, (e) => {
      if (e === null) {
        this._logger.info('Watcher terminated. Probably due to operator CRD modification.');
        process.exit(1);
      }

      this._logger.error(e);
    });

    return fromPromise(watchPromise, (e) => e instanceof Error ? e : new Error('Failed to watch Discord bots'));
  }
}
