import type { Container } from '@adonisjs/fold';
import type { CleanedEnv } from 'envalid';
import type Application from '#/application';

export type ApplicationConfig = {
  appRoot: string;
  environment: string;
  version: string;
};

export interface ReportableException extends Error {
  shouldReport?: boolean;
}

export type ReportCallback = (error: ReportableException, app: Application) => void | Promise<void>;
export type CleanupCallback = (app: Application) => void | Promise<void>;
export type StartCallback = (app: Application) => (CleanupCallback | Promise<CleanupCallback>) | (Promise<void> | void);
export type BaseResolver<T> = (...args: unknown[]) => Promise<{ default: T }> | Promise<T> | T;
export type ModuleResolver = BaseResolver<new () => ModuleInterface | ModuleInterface>;
export type ConfigFileResolver = () => Promise<{ default: BaseConfig<unknown> }>;
export type EnvVariablesResolver = () => Promise<{ Env: CleanedEnv<any> }>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventMap {
  //
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ConfigBindings {
  //
}

export interface ContainerBindings {
  app: Application;
  container: Container<ContainerBindings>;
}

export type HooksState<T> = [T[], T[]];
export type HooksMap = {
  booting: HooksState<Application>;
  booted: HooksState<Application>;
  starting: HooksState<Application>;
  started: HooksState<Application>;
  shutdown: HooksState<Application>;
};

export interface ModuleInterface {
  readonly id: string;
  readonly author: string;
  readonly version: string;
  register?(app: Application): void;
  boot?(app: Application): Promise<void> | void;
  shutdown?(app: Application): Promise<void> | void;
  start?(app: Application): Promise<void> | void;
}

export interface KernelConfig {
  configFiles: ConfigFileResolver[];
  modules: ModuleResolver[];
}

export interface BaseConfig<T> {
  key: string;
  config: T;
}

export interface BootstrapperInterface {
  bootstrap(app: Application): Promise<void> | void;
}
