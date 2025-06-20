import path from 'node:path';
import debug from '#/debug';

export default class Path {
  public constructor(
    public readonly appRoot: string,
  ) {
    //
  }

  public resolve(...paths: string[]): string {
    debug('Resolving path with paths:', paths);
    return path.resolve(this.appRoot, ...paths);
  }

  public logs(...paths: string[]): string {
    return this.resolve('logs', ...paths);
  }
}
