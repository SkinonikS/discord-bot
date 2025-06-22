import type * as k8s from '@kubernetes/client-node';
import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import sleep from 'sleep-promise';
import type { ShardSpawnerConfig, ShardSpawnerInterface, SpawnInstance } from '#/types';

export default class ShardSpawner implements ShardSpawnerInterface{
  public constructor(
    protected readonly _sleepDelay: number,
  ) { }

  public async spawn(spawnInstance: SpawnInstance, conifg: ShardSpawnerConfig): Promise<Result<k8s.V1Deployment[], Error>> {
    const deployments: k8s.V1Deployment[] = [];
    let shardId = 0;
    while (shardId < conifg.totalShards) {
      const rateLimitKey = shardId % conifg.maxConcurrency;

      const spawnResult = await spawnInstance({
        shardId,
        totalShards: conifg.totalShards,
      });

      if (spawnResult.isErr()) {
        return err(spawnResult.error);
      }

      deployments.push(spawnResult.value);
      shardId++;

      if (shardId >= conifg.totalShards) {
        break;
      }

      if (rateLimitKey === conifg.maxConcurrency - 1) {
        await sleep(this._sleepDelay);
      }
    }

    return ok(deployments);
  }
}
