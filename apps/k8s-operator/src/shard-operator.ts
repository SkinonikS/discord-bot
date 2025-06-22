import * as k8s from '@kubernetes/client-node';
import type { Result } from 'neverthrow';
import { err, fromPromise } from 'neverthrow';
import type { Logger } from 'winston';
import DeploymentRepository from '#/deployment-repository';
import type DiscordGateway from '#/discord-gateway';
import { ManualDiscordGateway } from '#/discord-gateway';
import ReshardingManager from '#/resharding-manager';
import ShardCluster from '#/shard-cluster';
import ShardSpawner from '#/shard-spawner';
import type { DeploymentFactoryInterface, DiscordGatewayBotResponse, WatchObject } from '#/types';

export interface OperatorConfig {
  sleepDelay: number;
  gracePeriodSeconds: number;
  operatorVersion: string;
}

export class ShardOperator {
  protected readonly _kc: k8s.KubeConfig;
  protected readonly _apiApps: k8s.AppsV1Api;
  protected readonly _apiCore: k8s.CoreV1Api;
  protected readonly _apiWatch: k8s.Watch;

  protected readonly _discordGateway: DiscordGateway;
  protected readonly _shardCluster: ShardCluster;

  public constructor(
    protected readonly _logger: Logger,
    protected readonly _deploymentFactory: DeploymentFactoryInterface,
    protected readonly _operatorConfig: OperatorConfig,
  ) {
    this._kc = new k8s.KubeConfig();
    this._kc.loadFromDefault();
    this._apiApps = this._kc.makeApiClient(k8s.AppsV1Api);
    this._apiCore = this._kc.makeApiClient(k8s.CoreV1Api);
    this._apiWatch = new k8s.Watch(this._kc);

    this._discordGateway = new ManualDiscordGateway();
    this._shardCluster = new ShardCluster(
      new ShardSpawner(this._operatorConfig.sleepDelay),
      this._deploymentFactory,
      new DeploymentRepository(this._apiApps, this._operatorConfig.gracePeriodSeconds),
      new ReshardingManager(),
      this._logger,
      this._operatorConfig.operatorVersion,
    );
  }

  public async watch(): Promise<Result<AbortController, Error>> {
    const watchPromise = this._apiWatch.watch('/apis/example.com/v1/discordbots', { }, async (type, resource: WatchObject) => {
      if (type === 'ADDED') {
        const gatewayBotInfo = await this._getGatewayBotInfo(resource);

        if (gatewayBotInfo.isErr()) {
          this._logger.error(gatewayBotInfo.error);
          return;
        }

        const createClusterResult = await this._shardCluster.createCluster(resource, {
          totalShards: gatewayBotInfo.value.shards,
          maxConcurrency: gatewayBotInfo.value.sessionStartLimit.maxConcurrency,
        });

        if (createClusterResult.isErr()) {
          this._logger.error(createClusterResult.error);
          return;
        }

        this._logger.info(`Discord bot cluster '${resource.metadata.name}' added in namespace '${resource.metadata.namespace}' with ${gatewayBotInfo.value.shards} shards and reshard interval of ${resource.spec.sharding.reshardInterval}.`);
      } else if (type === 'MODIFIED') {
        const gatewayBotInfo = await this._getGatewayBotInfo(resource);

        if (gatewayBotInfo.isErr()) {
          this._logger.error(gatewayBotInfo.error);
          return;
        }

        const recreateClusterResult = await this._shardCluster.recreateCluster(resource, {
          totalShards: gatewayBotInfo.value.shards,
          maxConcurrency: gatewayBotInfo.value.sessionStartLimit.maxConcurrency,
        });

        if (recreateClusterResult.isErr()) {
          this._logger.error(recreateClusterResult.error);
          return;
        }

        this._logger.info(`Discord bot cluster '${resource.metadata.name}' in namespace '${resource.metadata.namespace}' modified. Recreated with ${gatewayBotInfo.value.shards} shards.`);
      } else if (type === 'DELETED') {
        const destroyClusterResult = await this._shardCluster.destroyCluster(resource);

        if (destroyClusterResult.isErr()) {
          this._logger.error(destroyClusterResult.error);
          return;
        }

        this._logger.info(`Discord bot cluster '${resource.metadata.name}' deleted in namespace '${resource.metadata.namespace}'`);
      }
    }, (e) => {
      if (e === null) {
        this._logger.info('Watcher closed. Probably due to operator CRD modification.');
        return;
      }

      this._logger.error(e);
    });

    return fromPromise(watchPromise, (e) => e instanceof Error ? e : new Error('Failed to watch Discord bots'));
  }

  protected async _getGatewayBotInfo(resource: WatchObject): Promise<Result<DiscordGatewayBotResponse, Error>> {
    const secrets = await this._apiCore.readNamespacedSecret({ namespace: resource.metadata.namespace, name: resource.spec.tokenSecretRef.name });
    const tokenBase64 = secrets.data?.[resource.spec.tokenSecretRef.key];

    if (! tokenBase64) {
      return err(new Error(`Token secret not found for Discord bot: ${resource.metadata.name}`));
    }

    const discordToken = Buffer.from(tokenBase64, 'base64').toString('utf-8');
    return this._discordGateway.getBotInfo(discordToken);
  }
}
