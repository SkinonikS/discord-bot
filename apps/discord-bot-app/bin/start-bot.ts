import path from 'node:path';
import { Application } from '@package/framework';
import { version } from '#/package.json';
import { createKernel } from '#start/kernel';
import 'reflect-metadata';

const app = new Application(path.resolve(import.meta.dirname, '..'), version);
Application.setInstance(app);

const kernel = await createKernel(app);
void kernel.run();
