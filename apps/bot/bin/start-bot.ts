import path from 'node:path';
import { ForkWorkerSpawner, WorkerManager } from '@framework/core/workers';

const workers = new WorkerManager(
  new ForkWorkerSpawner(),
);

workers.register([
  {
    path: path.resolve(import.meta.dirname, 'workers', 'discord-worker.js'),
    args: [],
  },
]);

workers.on('ready', (workers) => {
  for (const worker of workers) {
    console.log(`Worker ${worker.id} is ready.`);
  }
});

workers.spawn();
