import type { CleanedEnv } from 'envalid';
import type { Application } from '#application/application.js';

export interface ContainerBindings {
  app: Application;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ConfigBindings {
  //
}

export interface ServiceProviderInterface {
  register?(): void;
  boot?(): Promise<void> | void;
  shutdown?(): Promise<void> | void;
}

export interface KernelConfig {
  configFiles: ConfigFileResolver[];
  serviceProviders: ServiceProviderResolver[];
}

export interface BaseConfig<T extends Record<string, unknown>> {
  key: string;
  config: T;
}

export type HooksState = [
  [Application],
  [Application],
];

export interface BootstrapperInterface {
  bootstrap(app: Application): Promise<void>;
}

export type CleanupCallback = (app: Application) => void | Promise<void>;
export type StartCallback = (app: Application) => (CleanupCallback | Promise<CleanupCallback>) | (Promise<void> | void);

export type KernelConfigResolver = () => Promise<{ default: KernelConfig }>;
export type ConfigFileResolver<T extends Record<string, unknown> = Record<string, unknown>> = () => Promise<{ default: BaseConfig<T> }>;
export type ServiceProviderResolver = () => Promise<{ default: new (app: Application) => ServiceProviderInterface }>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnvVariablesResolver = () => Promise<{ Env: CleanedEnv<any> }>;
export type BootstrapperResolver = () => Promise<{ default: new () => BootstrapperInterface } | BootstrapperInterface>;
