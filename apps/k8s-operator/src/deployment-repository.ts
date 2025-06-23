import type * as k8s from '@kubernetes/client-node';
import type { Result } from 'neverthrow';
import { fromPromise } from 'neverthrow';
import type { CreateDeploymentOptions, DeleteDeploymentsOptions } from './types';

export default class DeploymentRepository {
  public constructor(
    protected readonly _apiApps: k8s.AppsV1Api,
    protected readonly _gracePeriodSeconds: number = 30,
  ) { }

  public async createDeployment({ namespace, resource }: CreateDeploymentOptions): Promise<Result<k8s.V1Deployment, Error>> {
    return fromPromise(this._apiApps.createNamespacedDeployment({
      namespace,
      body: resource,
    }), (e) => e instanceof Error ? e : new Error('Failed to create deployment'));
  }

  public async deleteDeployments({ namespace, app }: DeleteDeploymentsOptions): Promise<Result<k8s.V1Status, Error>> {
    return fromPromise(this._apiApps.deleteCollectionNamespacedDeployment({
      namespace,
      gracePeriodSeconds: this._gracePeriodSeconds,
      labelSelector: `app.kubernetes.io/name=${app}`,
    }), (e) => e instanceof Error ? e : new Error('Failed to delete deployment'));
  }
}
