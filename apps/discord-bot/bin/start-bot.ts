import path from 'path';
import { Application } from '@framework/core/app';
import kernelConfig from '#/bootstrap/kernel';
import pkg from '#/package.json';
import { createKernel } from '#start/kernel';
import 'reflect-metadata';

const app = new Application({
  appRoot: path.resolve(import.meta.dirname, '..'),
  version: pkg.version,
  environment: 'development',
});
Application.setInstance(app);

const kernel = await createKernel(app, kernelConfig);
void kernel.run((app) => app.start());
