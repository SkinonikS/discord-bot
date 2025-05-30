import { Application } from '#core/application/application';

export interface ServiceProviderInterface {
  register?(): void;
  boot?(): Promise<void> | void;
  shutdown?(): Promise<void> | void;
}

export interface DefineConfigResult<T> {
  key: string;
  config: T;
}

export type ConfigResolver  = () => Promise<{ default: DefineConfigResult<unknown> }>;
export type ServiceProviderResolver  = () => Promise<{ default: new (app: Application) => ServiceProviderInterface }>;
