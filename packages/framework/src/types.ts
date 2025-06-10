import type { Container } from '@adonisjs/fold';
import type { CleanedEnv } from 'envalid';
import type Application from '#/application';

export type ConfigPathValue<T, P extends string> =
  P extends keyof T ? T[P] :
    P extends `${infer K}.${infer R}` ?
      K extends keyof T ?
        ConfigPathValue<T[K] extends Record<string, unknown> ? T[K] : object, R> :
        unknown :
      unknown;

export interface EventMap {
  'app:booting': [Application];
  'app:booted': [Application];
  'app:shutdown': [Application];
}

export type HooksState<T> = [T[], T[]];
export type HooksMap = {
  'booting': HooksState<Application>;
  'booted': HooksState<Application>;
  'shutdown': HooksState<Application>;
};

export interface ContainerBindings {
  app: Application;
  container: Container<ContainerBindings>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ConfigBindings {
  //
}

export interface BaseLoaderInterface<T> {
  load(app: Application): Promise<T[]>;
}

export type BootstrapperLoaderInterface = BaseLoaderInterface<BootstrapperInterface>;
export type ModuleLoaderInterface = BaseLoaderInterface<ModuleInterface>;
export type ConfigFilesLoaderInterface = BaseLoaderInterface<BaseConfig<Record<string, unknown>>>;

export interface ModuleInterface {
  readonly id: string;
  register?(): void;
  boot?(): Promise<void> | void;
}

export interface KernelConfig {
  configFiles: ConfigFilesLoaderInterface;
  modules: ModuleLoaderInterface;
}

export interface BaseConfig<T extends Record<string, unknown>> {
  key: string;
  config: T;
}

export interface BootstrapperInterface {
  bootstrap(app: Application): Promise<void> | void;
}

export type CleanupCallback = (app: Application) => void | Promise<void>;
export type StartCallback = (app: Application) => (CleanupCallback | Promise<CleanupCallback>) | (Promise<void> | void);

export type KernelConfigResolver = () => Promise<{ default: KernelConfig }>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnvVariablesResolver = () => Promise<{ Env: CleanedEnv<any> }>;
