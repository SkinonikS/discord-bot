import type * as k8s from '@kubernetes/client-node';
import type { DeploymentFactoryInterface, DeploymentObject, ShardConfig } from '#/types';

export default class DeploymentFactory implements DeploymentFactoryInterface {
  public constructor(protected _resolveName: (resource: DeploymentObject, shardConfig: ShardConfig) => string) { }

  public createDeployment(resource: DeploymentObject, shardConfig: ShardConfig): k8s.V1Deployment {
    return {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: `${resource.appName}-shard-${shardConfig.shardId}`,
        namespace: resource.metadata.namespace,
        labels: {
          'app.kubernetes.io/name': resource.appName,
          'app.kubernetes.io/instance': `shard-${shardConfig.shardId}`,
          'app.kubernetes.io/version': resource.version,
        },
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: {
            'app.kubernetes.io/name': resource.appName,
            'app.kubernetes.io/instance': `shard-${shardConfig.shardId}`,
            'app.kubernetes.io/version': resource.version,
          },
        },
        template: {
          metadata: {
            labels: {
              'app.kubernetes.io/name': resource.appName,
              'app.kubernetes.io/instance': `shard-${shardConfig.shardId}`,
              'app.kubernetes.io/version': resource.version,
            },
          },
          spec: {
            containers: [
              {
                name: resource.spec.container.name,
                image: resource.spec.container.image,
                imagePullPolicy: resource.spec.container.imagePullPolicy,
                env: [
                  ...resource.spec.env ?? [],
                  {
                    name: 'DISCORD_TOKEN',
                    valueFrom: {
                      secretKeyRef: {
                        name: resource.spec.tokenSecretRef.name,
                        key: resource.spec.tokenSecretRef.key,
                      },
                    },
                  },
                  {
                    name: 'SHARD_ID',
                    value: shardConfig.shardId.toString(),
                  },
                  {
                    name: 'SHARD_COUNT',
                    value: shardConfig.totalShards.toString(),
                  },
                ],
              },
            ],
          },
        },
      },
    };
  }
}
