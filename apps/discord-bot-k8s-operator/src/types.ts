import type * as k8s from '@kubernetes/client-node';
import type { Result } from 'neverthrow';

export interface DeleteDeploymentsOptions {
  name: string;
  namespace: string;
}

export interface CreateDeploymentOptions {
  namespace: string;
  resource: k8s.V1Deployment;
}

export interface ListDeploymentsOptions {
  name: string;
  namespace: string;
}

export interface DeploymentStorageInterface {
  createDeployment(options: CreateDeploymentOptions): Promise<Result<k8s.V1Deployment, Error>>;
  deleteDeployments(options: DeleteDeploymentsOptions): Promise<Result<k8s.V1Status, Error>>;
  listDeployments(options: ListDeploymentsOptions): Promise<Result<k8s.V1DeploymentList, Error>>;
}

export type ReshardIntervalCallback = (watchObject: WatchObject) => Promise<void> | void;

export interface StartReshardingIntervalOptions {
  watchObject: WatchObject;
  interval: number | string;
}

export interface ReshardingManagerInterface {
  startInterval(options: StartReshardingIntervalOptions, callback: ReshardIntervalCallback): Result<void, Error>;
  stopInterval(watchObject: WatchObject): boolean;
  hasInterval(watchObject: WatchObject): boolean;
}

export interface GatwayInfoProviderInterface {
  fetchInfo(botToken: string): Promise<Result<GatewayInfo, Error>>;
}

export interface OpqueSecretOptions {
  name: string;
  namespace: string;
  key: string;
}

export interface SecretStorageInterface {
  getSecretOpaque(options: OpqueSecretOptions): Promise<Result<string, Error>>;
}

export interface GatewayInfo {
  shards: number;
  sessionStartLimit: {
    total: number;
    remaining: number;
    resetAfter: number;
    maxConcurrency: number;
  };
}

export interface ShardOptions {
  shardId: number;
  gatewayInfo: GatewayInfo;
}

export interface ShardSpawnerInterface {
  spawn(watchObject: WatchObject, gatewayInfo: GatewayInfo): Promise<Result<k8s.V1Deployment[], Error>>;
}

export interface DeploymentManifestFactoryInterface {
  createManifest: (watchObject: WatchObject, shardOptions: ShardOptions) => k8s.V1Deployment;
}

export interface Metadata {
  name: string;
  namespace: string;
  uid: string;
}

export interface WatchObject {
  metadata: Metadata;
  spec: Spec;
}

export type Env = {
  name: string;
  valueFrom?: {
    secretKeyRef: {
      name: string;
      key: string;
    };
  };
  value?: string;
};

export interface Resources {
  limits?: {
    cpu?: string;
    memory?: string;
  };
  requests?: {
    cpu?: string;
    memory?: string;
  };
}

export interface Spec {
  tokenSecretRef: {
    envVarName: string;
    name: string;
    key: string;
  };
  container: {
    image: string;
    imagePullPolicy: string;
    resources?: Resources;
  };
  initContainers?: {
    name: string;
    image: string;
    imagePullPolicy: string;
    command?: string[];
    resources?: Resources;
  }[];
  sharding: {
    reshardInterval: string | number;
  };
  resources?: Resources;
  env?: Env[];
}
