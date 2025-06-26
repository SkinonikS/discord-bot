import type * as k8s from '@kubernetes/client-node';
import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import type { DeploymentManifestFactoryInterface, DeploymentStorageInterface, GatewayInfo, ShardSpawnerInterface, WatchObject } from '#/types';

export default class ShardSpawner implements ShardSpawnerInterface {
  public constructor(
    protected readonly _deploymentFactory: DeploymentManifestFactoryInterface,
    protected readonly _deploymentStorage: DeploymentStorageInterface,
  ) { }

  public async spawn(watchObject: WatchObject, gatewayInfo: GatewayInfo): Promise<Result<k8s.V1Deployment[], Error>> {
    const deployments: k8s.V1Deployment[] = [];

    for (let i = 0; i < gatewayInfo.shards; i++) {
      const deployment = this._deploymentFactory.createManifest(watchObject, {
        shardId: i,
        gatewayInfo: gatewayInfo,
      });

      const spawnResult = await this._deploymentStorage.createDeployment({
        namespace: watchObject.metadata.namespace,
        resource: deployment,
      });

      if (spawnResult.isErr()) {
        return err(spawnResult.error);
      }

      deployments.push(spawnResult.value);
    }

    return ok(deployments);
  }
}
