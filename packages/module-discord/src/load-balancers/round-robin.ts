import type { Application } from '@framework/core';
import type { Client } from 'discord.js';
import type { createClient } from 'redis';
import type { LoadBalancerInterface } from '#/types';

export type ConsumeCallback = (uid: string, shardId?: number) => Promise<void>;

export class RoundRobinLoadBalancer implements LoadBalancerInterface {
  public constructor(
    protected readonly _app: Application,
    protected readonly _discord: Client,
    protected readonly _redis: ReturnType<typeof createClient>,
  ) {
    //
  }

  public async register(): Promise<void> {
    await this._redis.sAdd(this._createReplicasKey(this._discord.shardId), this._app.uid);
  }

  public async unregister(): Promise<void> {
    await this._redis.sRem(this._createReplicasKey(this._discord.shardId), this._app.uid);
  }

  public async execute(callback: ConsumeCallback): Promise<void> {
    const shardId = this._discord.shardId;
    const replicasKey = this._createReplicasKey(shardId);
    const counterKey = this._createCounterKey(shardId);

    const replicas = await this._redis.sMembers(replicasKey);
    if (replicas.length === 0) {
      return;
    }

    replicas.sort();

    const counter = await this._getCurrentCounter(counterKey);
    const currentIndex = counter % replicas.length;
    const currentReplica = replicas[currentIndex];

    const isMyTurn = currentReplica === this._app.uid;
    if (! isMyTurn) {
      return;
    }

    await callback(this._app.uid, shardId);
    await this._redis.incr(counterKey);
  }

  protected async _getCurrentCounter(counterKey: string): Promise<number> {
    let counter = await this._redis.get(counterKey);

    if (counter === null) {
      counter = '0';
      await this._redis.set(counterKey, counter);
    }

    return parseInt(counter);
  }

  protected _createReplicasKey(shardId: number): string {
    return `discord:shard:${shardId}:replicas`;
  }

  protected _createCounterKey(shardId: number): string {
    return `discord:shard:${shardId}:counter`;
  }
}
