import { fork } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import SimpleEvent from './event';
import type { WorkerInterface, WorkerSpawnerInterface } from '#/workers/types';

export class ForkWorker extends EventEmitter implements WorkerInterface {
  public constructor(protected readonly _fork: ChildProcess) {
    super();
    this.setMaxListeners(Infinity);

    this._fork.on('message', (message: unknown) => {
      try {
        const event = SimpleEvent.tryParse(message);
        this.emit(event.eventName, event.data);
      } catch {
        //
      }
    });

    this._fork.on('exit', (code, signal) => this.emit('exit', code, signal));
    this._fork.on('spawn', () => this.emit('spawn', this.id));
    this._fork.on('disconnect', () => this.emit('disconnect'));
    this._fork.on('close', (code, signal) => this.emit('close', code, signal));
    this._fork.on('error', (error: Error) => this.emit('error', error));
  }

  public get id(): string {
    return this._fork.pid?.toString() ?? 'unknown';
  }

  public get isAlive(): boolean {
    return this._fork.connected;
  }

  public send(message: never): boolean {
    return this._fork.send(message);
  }

  public kill(): void {
    this._fork.kill('SIGTERM');
  }
}

export class ForkWorkerSpawner implements WorkerSpawnerInterface {
  public spawn(path: string, args: string[] = []): WorkerInterface {
    return new ForkWorker(fork(path, args));
  }
}
