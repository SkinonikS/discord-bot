export interface CronJobInterface {
  readonly name: string;
  readonly cronTime: string;
  onTick(): Promise<void> | void;
  onExit?(): Promise<void> | void;
}
