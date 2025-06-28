import type { CleanedEnv } from 'envalid';
import type Application from '#src/app/application';

export interface BootstrapperInterface {
  bootstrap(app: Application): Promise<void> | void;
}

export type BaseResolver<T> = (...args: unknown[]) => Promise<{ default: T } | T> | T;
export type CleanupCallback = (app: Application) => void | Promise<void>;
export type StartCallback = (app: Application) => (CleanupCallback | Promise<CleanupCallback>) | (Promise<void> | void);
export type BootstrapperResolver = BaseResolver<BootstrapperInterface | (new () => BootstrapperInterface)>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EnvVariablesResolver = () => Promise<{ Env: CleanedEnv<any> }>;
