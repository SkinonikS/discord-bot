import type * as k8s from '@kubernetes/client-node';
import type { Result } from 'neverthrow';

export type SpawnInstance = (shardConfig: SpawnInstanceConfig) => Promise<Result<k8s.V1Deployment, Error>>;

export interface ShardSpawnerInterface {
  spawn(spawnInstance: SpawnInstance, config: ShardSpawnerConfig): Promise<Result<k8s.V1Deployment[], Error>>;
}

export interface SpawnInstanceConfig {
  shardId: number;
  totalShards: number;
}
export interface ShardSpawnerConfig {
  maxConcurrency: number;
  totalShards: number;
}

export interface Metadata {
  name: string;
  namespace: string;
  uid: string;
}

export interface DeploymentSpec {
  containerImage: string;
  imagePullPolicy: string;
  tokenSecretRef: {
    name: string;
    key: string;
  };
  container: {
    name: string;
    image: string;
    imagePullPolicy: string;
  };
  sharding: {
    reshardInterval: string | number;
  };
  env?: {
    name: string;
    valueFrom?: {
      secretKeyRef: {
        name: string;
        key: string;
      };
    };
    value?: string;
  }[];
}

export interface WatchObject {
  metadata: Metadata;
  spec: DeploymentSpec;
}

export interface ShardConfig {
  shardId: number;
  totalShards: number;
}

export interface DeleteDeploymentsOptions {
  app: string;
  namespace: string;
}

export interface CreateDeploymentOptions {
  namespace: string;
  resource: k8s.V1Deployment;
}

export interface DeploymentRepositoryInterface {
  createDeployment(options: CreateDeploymentOptions): Promise<Result<k8s.V1Deployment, Error>>;
  deleteDeployments(options: DeleteDeploymentsOptions): Promise<Result<k8s.V1Status, Error>>;
}

export interface DeploymentFactoryInterface {
  createDeployment: (resource: DeploymentObject, shardConfig: ShardConfig) => k8s.V1Deployment;
}

export interface StartReshardingOptions {
  resourceUid: string;
  intervalDelay: number;
}

export type StartReshardCallback = (resourceUid: string) => Promise<void>;

export interface ReshardingManagerInterface {
  startInterval({ resourceUid, intervalDelay }: StartReshardingOptions, callback: StartReshardCallback): Result<void, Error>;
  stopInterval(resourceUid: string): boolean;
  hasInterval(resourceUid: string): boolean;
}

export interface DiscordGatewayBotResponse {
  shards: number;
  sessionStartLimit: {
    total: number;
    remaining: number;
    resetAfter: number;
    maxConcurrency: number;
  };
}

export interface DiscordGatewayInterface {
  getBotInfo(botToken: string): Promise<Result<DiscordGatewayBotResponse, Error>>;
}

export interface ShardClusterInterface {
  createCluster(resource: WatchObject, shardSpawnerConfig: ShardSpawnerConfig): Promise<Result<k8s.V1Deployment[], Error>>;
  spawnShards(resource: WatchObject, shardSpawnerConfig: ShardSpawnerConfig): Promise<Result<k8s.V1Deployment[], Error>>;
}

export interface DiscordBotOperatorSpec {
  containerImage: string;
  imagePullPolicy: string;
  tokenSecretRef: {
    name: string;
    key: string;
  };
  container: {
    name: string;
    image: string;
    imagePullPolicy: string;
  };
  sharding: {
    reshardInterval: string | number;
  };
  env?: {
    name: string;
    valueFrom?: {
      secretKeyRef: {
        name: string;
        key: string;
      };
    };
    value?: string;
  }[];
}

export interface DeploymentObject {
  appName: string;
  version: string;
  metadata: Metadata;
  spec: DiscordBotOperatorSpec;
}
