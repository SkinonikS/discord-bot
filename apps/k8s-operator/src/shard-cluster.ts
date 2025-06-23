import type * as k8s from '@kubernetes/client-node';
import type { Result } from 'neverthrow';
import parseDuration from 'parse-duration';
import type { Logger } from 'winston';
import type ShardSpawner from '#/shard-spawner';
import type { DeploymentFactoryInterface, DeploymentRepositoryInterface, ReshardingManagerInterface, ShardSpawnerConfig, WatchObject } from '#/types';

export default class ShardCluster {
  public fallbackReshardInterval = 360000;

  public constructor(
    protected readonly _shardSpawner: ShardSpawner,
    protected readonly _deploymentFactory: DeploymentFactoryInterface,
    protected readonly _deploymentRepository: DeploymentRepositoryInterface,
    protected readonly _reshardingManager: ReshardingManagerInterface,
    protected readonly _logger: Logger,
    protected readonly _version: string,
  ) { }

  public async destroyCluster(resource: WatchObject): Promise<Result<k8s.V1Status, Error>> {
    this._reshardingManager.stopInterval(resource.metadata.uid);
    return this._deploymentRepository.deleteDeployments({
      app: resource.metadata.name,
      namespace: resource.metadata.namespace,
    });
  }

  public async createCluster(resource: WatchObject, shardSpawnerConfig: ShardSpawnerConfig): Promise<Result<k8s.V1Deployment[], Error>> {
    const spawnShardsResult = await this.spawnShards(resource, shardSpawnerConfig);

    if (spawnShardsResult.isErr()) {
      this._logger.error(spawnShardsResult.error);
      return spawnShardsResult;
    }

    const intervalDelay = typeof resource.spec.sharding.reshardInterval === 'number'
      ? resource.spec.sharding.reshardInterval
      : parseDuration(resource.spec.sharding.reshardInterval) ?? this.fallbackReshardInterval;

    this._reshardingManager.startInterval({
      resourceUid: resource.metadata.uid,
      intervalDelay,
    }, async () => {
      this._logger.info(`Resharding bot cluster for resource '${resource.metadata.name}' in namespace '${resource.metadata.namespace}'`);

      const deleteResult = await this._deploymentRepository.deleteDeployments({
        app: resource.metadata.name,
        namespace: resource.metadata.namespace,
      });

      if (deleteResult.isErr()) {
        this._logger.error(deleteResult.error);
        return;
      }

      await this.spawnShards(resource, shardSpawnerConfig);
    });

    return spawnShardsResult;
  }

  public async recreateCluster(resource: WatchObject, shardSpawnerConfig: ShardSpawnerConfig): Promise<Result<k8s.V1Deployment[], Error>> {
    await this.destroyCluster(resource);
    return this.createCluster(resource, shardSpawnerConfig);
  }

  public async spawnShards(resource: WatchObject, shardSpawnerConfig: ShardSpawnerConfig): Promise<Result<k8s.V1Deployment[], Error>> {
    return this._shardSpawner.spawn(async (shardConfig) => {
      const deployment = this._deploymentFactory.createDeployment({
        ...resource,
        appName: resource.metadata.name,
        version: this._version,
      }, shardConfig);

      return this._deploymentRepository.createDeployment({
        namespace: resource.metadata.namespace,
        resource: deployment,
      });
    }, shardSpawnerConfig);
  }
}
