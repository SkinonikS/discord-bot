import type { BaseResolver } from '@framework/core/kernel';
import type { SlashCommandInterface } from '#src/types';

export type SlashCommandResolver = BaseResolver<new (...args: unknown[]) => SlashCommandInterface>;

export interface SlashCommandConfig extends Record<string, unknown> {
  commands: SlashCommandResolver[];
}
