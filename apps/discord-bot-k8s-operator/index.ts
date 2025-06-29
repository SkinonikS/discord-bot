import * as k8s from '@kubernetes/client-node';
import Cluster from '#/cluster';
import DeploymentManifestFactory from '#/deployment-manifest-factory';
import DeploymentStorage from '#/deployment-storage';
import DiscordGatewayInfoProvider from '#/gateway-info-provider/discord-gateway-info-provider';
import { createLogger } from '#/logger';
import ReshardingManager from '#/resharding-manager';
import { SecretStorage } from '#/secret-storage';
import ShardSpawner from '#/shard-spawner';
import Watcher from '#/watcher';

const logger = createLogger();

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

export const start = async () => {
  await import('#/env'); // Ensure environment variables are loaded and validated before using them
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const appsApi = kc.makeApiClient(k8s.AppsV1Api);
  const coreApi = kc.makeApiClient(k8s.CoreV1Api);

  const secretStorage = new SecretStorage(coreApi);
  const deploymentStorage = new DeploymentStorage(appsApi);
  const deploymentFactory = new DeploymentManifestFactory((watchObject, shardOptions) => `${watchObject.metadata.name}-${shardOptions.shardId}`);
  const shardSpawner = new ShardSpawner(deploymentFactory, deploymentStorage);
  const reshardingManager = new ReshardingManager();
  const gatewayInfoProvider = new DiscordGatewayInfoProvider();
  const cluster = new Cluster(secretStorage, deploymentStorage, reshardingManager, gatewayInfoProvider, shardSpawner, logger);

  const watcher = new Watcher(new k8s.Watch(kc), logger);
  const watchResult = await watcher.watchFor(cluster);

  if (watchResult.isErr()) {
    logger.error(watchResult.error);
  } else {
    logger.info('Shard manager started watching for deployments');
  }
};

void start();
