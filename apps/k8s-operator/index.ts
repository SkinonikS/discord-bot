import pkg from './package.json';
import DeploymentFactory from '#/deployment-factory';
import { createLogger } from '#/logger';
import { ShardOperator } from '#/shard-operator';

export const start = async () => {
  const defaultDeploymentFactory = new DeploymentFactory((resource, shardConfig) => {
    return `${resource.metadata.name}-shard-${shardConfig.shardId}`;
  });

  const logger = createLogger();
  logger.info(`Starting Shard Operator version ${pkg.version}`);
  const operator = new ShardOperator(logger, defaultDeploymentFactory, {
    sleepDelay: 6000,
    gracePeriodSeconds: 30,
    operatorVersion: pkg.version,
  });

  const watchResult = await operator.watch();
  if (watchResult.isOk()) {
    logger.info('Shard manager started watching for deployments');
  } else {
    logger.error(watchResult.error);
    process.exit(1);
  }
};

void start();
