import { Application } from '#core/application/application';

export interface BootstrapperInterface {
  bootstrap(app: Application): Promise<void>;
}

export type BootstrapperResolver = () => Promise<{ default?: new () => BootstrapperInterface }>;
