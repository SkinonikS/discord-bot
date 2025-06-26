import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { DeploymentStorageInterface, GatwayInfoProviderInterface, ReshardingManagerInterface, SecretStorageInterface, ShardSpawnerInterface, WatchObject } from '#/types';

export default class Cluster {
  public constructor(
    protected readonly _secretStorage: SecretStorageInterface,
    protected readonly _deploymentStorage: DeploymentStorageInterface,
    protected readonly _reshardingManager: ReshardingManagerInterface,
    protected readonly _gatewayInfoProvider: GatwayInfoProviderInterface,
    protected readonly _shardSpawnerConfig: ShardSpawnerInterface,
  ) { }

  public async destroy(watchObject: WatchObject): Promise<Result<void, Error>> {
    const deleteResult = await this._deploymentStorage.deleteDeployments({
      namespace: watchObject.metadata.namespace,
      name: watchObject.metadata.name,
    });

    if (deleteResult.isErr()) {
      return err(deleteResult.error);
    }

    this._reshardingManager.stopInterval(watchObject);
    return ok();
  }

  public async create(watchObject: WatchObject): Promise<Result<void, Error>> {
    const secretResult = await this._secretStorage.getSecretOpaque({
      key: watchObject.spec.tokenSecretRef.key,
      name: watchObject.spec.tokenSecretRef.name,
      namespace: watchObject.metadata.namespace,
    });
    if (secretResult.isErr()) {
      return err(secretResult.error);
    }

    const gatewayInfo = await this._gatewayInfoProvider.fetchInfo(secretResult.value);
    if (gatewayInfo.isErr()) {
      return err(gatewayInfo.error);
    }

    const spawnResult = await this._shardSpawnerConfig.spawn(watchObject, gatewayInfo.value);
    if (spawnResult.isErr()) {
      return err(spawnResult.error);
    }

    return ok();
  }
}
