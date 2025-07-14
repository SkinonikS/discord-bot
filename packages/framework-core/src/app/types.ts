import type { Container } from '@adonisjs/fold';
import type { Exception } from '@poppinss/exception';
import type Application from '#src/app/application';

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

export type ApplicationConfig = {
  appRoot: string;
  environment: string;
  version: string;
};

export enum ApplicationState {
  INITIAL,
  BOOTED,
  STARTED,
  SHUTDOWN,
}

export interface ModuleInterface {
  readonly id: string;
  readonly author: string;
  readonly version: string;
  register?(app: Application): void;
  boot?(app: Application): Promise<void> | void;
  shutdown?(app: Application): Promise<void> | void;
  start?(app: Application): Promise<void> | void;
}

export type HooksState<T> = [T[], T[]];
export type HooksMap = {
  booting: HooksState<Application>;
  booted: HooksState<Application>;
  starting: HooksState<Application>;
  started: HooksState<Application>;
  shutdown: HooksState<Application>;
};

export interface ReportableException extends Exception {
  shouldReport?: boolean;
}

export type ReportCallback = (error: ReportableException, app: Application) => void | Promise<void>;
