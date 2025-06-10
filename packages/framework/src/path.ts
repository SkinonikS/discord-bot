import path from 'node:path';
import debug from '#/debug';

export default class Path {
  public constructor(
    public readonly appRoot: string,
    protected readonly _resolvePath: (...paths: string[]) => string = path.resolve.bind(path, appRoot),
  ) {
    //
  }

  public resolve(...paths: string[]): string {
    debug('Resolving path with paths:', paths);
    return this._resolvePath(this.appRoot, ...paths);
  }

  public logs(...paths: string[]): string {
    return this.resolve('logs', ...paths);
  }
}
