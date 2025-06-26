import type * as k8s from '@kubernetes/client-node';
import type { Result } from 'neverthrow';
import { err, fromPromise, ok } from 'neverthrow';
import type { OpqueSecretOptions, SecretStorageInterface } from '#/types';

export class SecretStorage implements SecretStorageInterface {
  public constructor(
    protected readonly _apiCore: k8s.CoreV1Api,
  ) { }

  public async getSecretOpaque({ name, namespace, key }: OpqueSecretOptions): Promise<Result<string, Error>> {
    const secrets = await fromPromise(this._apiCore.readNamespacedSecret({
      name,
      namespace,
    }), (e) => e instanceof Error ? e : new Error('Failed to read token secret'));

    if (secrets.isErr()) {
      return err(secrets.error);
    }

    const tokenBase64 = secrets.value.data?.[key];
    if (! tokenBase64) {
      return err(new Error(`Token secret not found for Discord bot: ${name}`));
    }

    return ok(Buffer.from(tokenBase64, 'base64').toString('utf-8'));
  }
}
