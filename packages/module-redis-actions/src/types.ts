import type { BaseResolver } from '@framework/core';
import type { Snowflake } from 'discord.js';
import type { Result } from 'neverthrow';

export type RedisActionResolver = BaseResolver<new (...args: unknown[]) => RedisActionInterface>;

export interface RedisActionsConfig {
  url: string;
  database: number;
  actions: RedisActionResolver[];
}

export interface RedisActionInterface {
  readonly name: string;
  execute(guildId: Snowflake, args: unknown): Promise<Result<void, Error>> | Result<void, Error>;
  validate(rawArgs: unknown): Result<unknown, Error>;
}
