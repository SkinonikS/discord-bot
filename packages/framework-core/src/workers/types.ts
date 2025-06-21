import type { EventEmitter } from 'node:events';

export type ReadListener = (message: unknown) => void;

export interface WorkerInterface extends EventEmitter {
  get id(): string;
  get isAlive(): boolean;
  send(message: never): boolean;
  kill(): void;
}

export interface WorkerSpawnerInterface {
  spawn(path: string, args?: string[]): WorkerInterface;
}
