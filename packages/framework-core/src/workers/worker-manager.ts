import { EventEmitter } from 'node:events';
import type { WorkerInterface, WorkerSpawnerInterface } from '#/workers/types';

export type EventMap = {
  'ready': [WorkerInterface[]];
};

export interface RegisterConfig {
  path: string;
  args?: string[];
}

export default class WorkerManager extends EventEmitter<EventMap> {
  protected _workers: Map<string, WorkerInterface> = new Map();
  protected _readyWorkers: Set<string> = new Set();
  protected _workerPaths: Map<string, string[]> = new Map();
  protected _workerStartupTimeout: NodeJS.Timeout | null = null;
  protected _isSpawned: boolean = false;

  public constructor(protected _workerSpawner: WorkerSpawnerInterface) {
    super();
    this.setMaxListeners(Infinity);
  }

  public register(workers: RegisterConfig[]): this {
    for (const worker of workers) {
      this._workerPaths.set(worker.path, worker.args ?? []);
    }

    return this;
  }

  public spawn(startupTimeout: number = 10000): void {
    if (this._isSpawned) {
      throw new Error('Workers have already been spawned.');
    }

    this._isSpawned = true;

    for (const [path, args] of this._workerPaths.entries()) {
      const worker = this._workerSpawner.spawn(path, args);
      worker.on('close', () => this._workers.delete(worker.id));
      worker.once('ready', () => {
        this._readyWorkers.add(worker.id);

        if (this._readyWorkers.size === this._workers.size) {
          if (this._workerStartupTimeout) {
            clearTimeout(this._workerStartupTimeout);
            this._workerStartupTimeout = null;
          }

          this.emit('ready', Array.from(this._workers.values()));
        }
      });

      this._workers.set(worker.id, worker);
    }

    this._workerStartupTimeout = setTimeout(() => {
      console.error(
        `Worker startup timeout exceeded: ${startupTimeout}ms. ` +
        `Ready workers ${this._readyWorkers.size} out of total workers ${this._workers.size}.`,
      );

      for (const worker of this._workers.values()) {
        worker.kill();
        this._workers.delete(worker.id);
      }
    }, startupTimeout);
  }

  public all(): WorkerInterface[] {
    return Array.from(this._workers.values());
  }

  public get(id: string): WorkerInterface | undefined {
    return this._workers.get(id) ?? undefined;
  }

  public kill(): void {
    for (const worker of this._workers.values()) {
      worker.kill();
    }

    this._workers.clear();
  }
}
