import type * as k8s from '@kubernetes/client-node';
import type { Result } from 'neverthrow';
import { fromPromise } from 'neverthrow';
import type { Logger } from 'winston';
import type Cluster from '#/cluster';
import type { ErrorWatchObject, WatchObject } from '#/types';

export default class Watcher {
  public constructor(
    protected readonly _watch: k8s.Watch,
    protected readonly _logger: Logger,
    protected readonly _watchUrl: string = '/apis/example.com/v1/discordbots',
  ) {
    //
  }

  public async watchFor(cluster: Cluster): Promise<Result<AbortController, Error>> {
    const startWatch = () => {
      const watch = this._watch.watch(this._watchUrl, { }, async (phase, watchObject) => {
        if (phase === 'ADDED') {
          const obj: WatchObject = watchObject;
          const addedResult = await cluster.create(obj);

          if (addedResult.isErr()) {
            if (addedResult.error.code !== 409) {
              this._logger.error(addedResult.error.error);
            }
          } else {
            this._logger.info(`Discord bot added: ${obj.metadata.name} in namespace ${obj.metadata.namespace}`, obj);
          }
        } else if (phase === 'MODIFIED') {
          const obj: WatchObject = watchObject;
          const modifiedResult = await cluster.destroy(obj)
            .then(() => cluster.create(obj));

          if (modifiedResult.isErr()) {
            this._logger.error(modifiedResult.error);
          } else {
            this._logger.info(`Discord bot modified successfully: ${obj.metadata.name} in namespace ${obj.metadata.namespace}`, obj);
          }
        } else if (phase === 'DELETED') {
          const obj: WatchObject = watchObject;
          const deletedResult = await cluster.destroy(obj);

          if (deletedResult.isErr()) {
            this._logger.error(deletedResult.error);
          } else {
            this._logger.info(`Discord bot deleted successfully: ${obj.metadata.name} in namespace ${obj.metadata.namespace}`, obj);
          }
        } else if (phase === 'ERROR') {
          const obj: ErrorWatchObject = watchObject;

          if (obj.code !== 410) {
            this._logger.error(`Error in watch phase: ${obj.message} (reason: ${obj.reason}) (code: ${obj.code})`, obj);
          }
        } else {
          this._logger.warn(`Unknown watch phase recieved: ${phase}`, watchObject);
        }
      }, (e) => {
        if (e) {
          const error = e instanceof Error ? e : new Error(`Unknown error in watch: ${String(e)}`, { cause: e });
          this._logger.error(error);
          process.exit(1);
        }

        this._logger.info('Restarting watcher...');
        setTimeout(async () => {
          const watchResult = await startWatch();
          if (watchResult.isErr()) {
            throw watchResult.error;
          }
        }, 1000);
      });

      return fromPromise(watch, (e) => e instanceof Error ? e : new Error(`Failed to watch Discord bots: ${String(e)})`, { cause: e }));
    };

    return startWatch();
  }
}
