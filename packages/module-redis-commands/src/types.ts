import type { Application } from '@framework/core';
import type { Result } from 'neverthrow';

export interface RedisCommandsConfig {
  url: string;
  database: number;
  commands: RedisCommandLoaderInterface;
}

export interface RedisCommandInterface<T = unknown> {
  readonly name: string;
  execute(args: T): Promise<Result<void, Error>> | Result<void, Error>;
  validate(rawArgs: unknown): Result<T, Error>;
}

export interface RedisCommandLoaderInterface {
  load(app: Application): Promise<RedisCommandInterface[]>;
}
