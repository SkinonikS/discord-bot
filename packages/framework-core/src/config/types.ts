import type { ModuleInterface } from '#src/app/types';
import type { BaseResolver } from '#src/kernel/types';

export interface KernelConfig {
  configFiles: ConfigFileResolver[];
  modules: ModuleResolver[];
}

export interface BaseConfig<T> {
  key: string;
  config: T;
}

export type ModuleResolver = BaseResolver<ModuleInterface | (new () => ModuleInterface)>;
export type ConfigFileResolver = () => Promise<{ default: BaseConfig<unknown> }>;
