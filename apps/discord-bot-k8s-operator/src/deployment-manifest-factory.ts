import type * as k8s from '@kubernetes/client-node';
import type { DeploymentManifestFactoryInterface, ShardOptions, WatchObject } from '#/types';

export default class DeploymentManifestFactory implements DeploymentManifestFactoryInterface {
  public constructor(
    protected _resolveName: (watchObject: WatchObject, shardOptions: ShardOptions) => string,
  ) { }

  public createManifest(watchObject: WatchObject, shardOptions: ShardOptions): k8s.V1Deployment {
    const name = this._resolveName(watchObject, shardOptions);

    return {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name,
        namespace: watchObject.metadata.namespace,
        labels: {
          'app.kubernetes.io/name': watchObject.metadata.name,
          'app.kubernetes.io/instance': name,
          'app.kubernetes.io/managed-by': 'discord-bot-operator',
          'shard-id': shardOptions.shardId.toString(),
        },
      },
      spec: {
        // TODO: Add support for auto-scale esource limits
        replicas: 1,
        selector: {
          matchLabels: {
            'app.kubernetes.io/name': watchObject.metadata.name,
            'app.kubernetes.io/managed-by': 'discord-bot-operator',
          },
        },
        template: {
          metadata: {
            labels: {
              'app.kubernetes.io/name': watchObject.metadata.name,
              'app.kubernetes.io/instance': name,
              'app.kubernetes.io/managed-by': 'discord-bot-operator',
              'shard-id': shardOptions.shardId.toString(),
            },
          },
          spec: {
            resources: watchObject.spec.resources,
            initContainers: watchObject.spec?.initContainers,
            containers: [
              {
                name: `discord-bot-shard-${shardOptions.shardId}`,
                image: watchObject.spec.container.image,
                imagePullPolicy: watchObject.spec.container.imagePullPolicy,
                resources: watchObject.spec.container.resources,
                readinessProbe: {
                  initialDelaySeconds: 10,
                  periodSeconds: 10,
                  timeoutSeconds: 5,
                  successThreshold: 1,
                  failureThreshold: 3,
                  httpGet: {
                    scheme: 'HTTP',
                    port: watchObject.spec.container.httpProbePort,
                    path: '/readyz',
                  },
                },
                livenessProbe: {
                  initialDelaySeconds: 10,
                  periodSeconds: 10,
                  timeoutSeconds: 5,
                  successThreshold: 1,
                  failureThreshold: 3,
                  httpGet: {
                    scheme: 'HTTP',
                    port: watchObject.spec.container.httpProbePort,
                    path: '/livez',
                  },
                },
                env: [
                  ...watchObject.spec.env ?? [],
                  {
                    name: watchObject.spec.tokenSecretRef.envVarName,
                    valueFrom: {
                      secretKeyRef: {
                        name: watchObject.spec.tokenSecretRef.name,
                        key: watchObject.spec.tokenSecretRef.key,
                      },
                    },
                  },
                  {
                    name: 'DISCORD_SHARD_ID',
                    value: shardOptions.shardId.toString(),
                  },
                  {
                    name: 'DISCORD_SHARD_COUNT',
                    value: shardOptions.gatewayInfo.shards.toString(),
                  },
                  {
                    name: 'DISCORD_RATE_LIMIT_MAX_CONCURRENCY',
                    value: shardOptions.gatewayInfo.sessionStartLimit.maxConcurrency.toString(),
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
