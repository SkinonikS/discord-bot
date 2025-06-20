import type { LoggerInterface } from '@module/logger';
import { Collection } from 'discord.js';
import type { Queue } from 'distube';

export default class Controller {
  protected readonly _idleTimeouts: Collection<string, NodeJS.Timeout> = new Collection();

  public constructor(protected readonly _logger: LoggerInterface) { }

  public debug(message: string): void {
    this._logger.debug(message);
  }

  public error(error: Error): void {
    this._logger.error(error);
  }

  public finish(queue: Queue): void {
    if (queue.songs.length <= 1) {
      this._idleTimeouts.set(queue.id, setTimeout(() => {
        queue.voice.leave();
      }, 30_000));
    }
  }

  public playSong(queue: Queue): void {
    if (this._idleTimeouts.has(queue.id)) {
      clearTimeout(this._idleTimeouts.get(queue.id));
      this._idleTimeouts.delete(queue.id);
    }
  }
}
