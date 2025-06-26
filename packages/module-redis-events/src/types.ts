import type { BaseResolver } from '@framework/core';
import type { Snowflake } from 'discord.js';
import type { Result } from 'neverthrow';

export type EventHandlerResolver = BaseResolver<new (...args: unknown[]) => EventHandlerInterface>;

export interface EventsConfig {
  database: number;
  channelName: string;
  eventHandlers: EventHandlerResolver[];
}

export interface EventHandlerInterface {
  readonly name: string;
  execute(guildId: Snowflake, args: unknown): Promise<Result<void, Error>> | Result<void, Error>;
  validate(rawArgs: unknown): Result<unknown, Error>;
}
