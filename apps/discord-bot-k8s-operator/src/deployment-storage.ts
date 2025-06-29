import type * as k8s from '@kubernetes/client-node';
import type { Result } from 'neverthrow';
import { fromPromise } from 'neverthrow';
import type { CreateDeploymentOptions, DeleteDeploymentsOptions, DeploymentStorageInterface, ListDeploymentsOptions } from '#/types';

export default class DeploymentStorage implements DeploymentStorageInterface {
  public constructor(
    protected readonly _apiApps: k8s.AppsV1Api,
    protected readonly _gracePeriodSeconds: number = 30,
  ) { }

  public async listDeployments({ namespace, name }: ListDeploymentsOptions): Promise<Result<k8s.V1DeploymentList, Error>> {
    return fromPromise(this._apiApps.listNamespacedDeployment({
      namespace,
      labelSelector: `app.kubernetes.io/name=${name},app.kubernetes.io/managed-by=discord-bot-operator`,
    }), (e) => e instanceof Error ? e : new Error('Failed to list deployments'));
  }

  public async createDeployment({ namespace, resource }: CreateDeploymentOptions): Promise<Result<k8s.V1Deployment, Error>> {
    return fromPromise(this._apiApps.createNamespacedDeployment({
      namespace,
      body: resource,
    }), (e) => e instanceof Error ? e : new Error('Failed to create deployment'));
  }

  public async deleteDeployments({ namespace, name }: DeleteDeploymentsOptions): Promise<Result<k8s.V1Status, Error>> {
    return fromPromise(this._apiApps.deleteCollectionNamespacedDeployment({
      namespace,
      gracePeriodSeconds: this._gracePeriodSeconds,
      labelSelector: `app.kubernetes.io/name=${name},app.kubernetes.io/managed-by=discord-bot-operator`,
    }), (e) => e instanceof Error ? e : new Error('Failed to delete deployment'));
  }
}
