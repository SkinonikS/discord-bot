import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';
import type { Logger } from 'winston';
import type { DeploymentStorageInterface, ErrorResult, GatwayInfoProviderInterface, ReshardingManagerInterface, SecretStorageInterface, ShardSpawnerInterface, WatchObject } from '#/types';

export default class Cluster {
  public constructor(
    protected readonly _secretStorage: SecretStorageInterface,
    protected readonly _deploymentStorage: DeploymentStorageInterface,
    protected readonly _reshardingManager: ReshardingManagerInterface,
    protected readonly _gatewayInfoProvider: GatwayInfoProviderInterface,
    protected readonly _shardSpawnerConfig: ShardSpawnerInterface,
    protected readonly _logger: Logger,
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

  public async create(watchObject: WatchObject): Promise<Result<void, ErrorResult>> {
    const readResult = await this._deploymentStorage.listDeployments({
      namespace: watchObject.metadata.namespace,
      name: watchObject.metadata.name,
    });

    if (readResult.isErr()) {
      return err({ error: readResult.error, code: 500 });
    }

    if (readResult.value.items.length > 0) {
      const error = new Error(`Deployments for '${watchObject.metadata.name}' already exists in namespace '${watchObject.metadata.namespace}'.`);
      return err({ error, code: 409 });
    }

    const secretResult = await this._secretStorage.getSecretOpaque({
      key: watchObject.spec.tokenSecretRef.key,
      name: watchObject.spec.tokenSecretRef.name,
      namespace: watchObject.metadata.namespace,
    });

    if (secretResult.isErr()) {
      return err({ error: secretResult.error, code: 500 });
    }

    const gatewayInfo = await this._gatewayInfoProvider.fetchInfo(secretResult.value);
    if (gatewayInfo.isErr()) {
      return err({ error: gatewayInfo.error, code: 500 });
    }

    const spawnResult = await this._shardSpawnerConfig.spawn(watchObject, gatewayInfo.value);
    if (spawnResult.isErr()) {
      return err({ error: spawnResult.error, code: 500 });
    }

    this._reshardingManager.startInterval({
      watchObject,
      interval: watchObject.spec.sharding.reshardInterval,
    }, async (watchObject) => {
      this._logger.info(`Resharding for ${watchObject.metadata.name} in namespace ${watchObject.metadata.namespace}`);

      const destroyResult = await this.destroy(watchObject);
      if (destroyResult.isErr()) {
        this._logger.error('Failed to destroy deployments during resharding: ', destroyResult.error);
        return;
      }

      const createResult = await this.create(watchObject);
      if (createResult.isErr()) {
        this._logger.error('Failed to create deployments during resharding: ', createResult.error);
        return;
      }
    });

    return ok();
  }
}
