import path from 'node:path';
import { Application } from '@framework/core';
import pkg from '../package.json';
import { createKernel } from '#start/kernel';

const app = new Application(path.resolve(import.meta.dirname, '..'), pkg.version);
Application.setInstance(app);

const kernel = await createKernel(app);
void kernel.run();
