export interface CronJobInterface {
  readonly name: string;
  readonly cronTime: string;
  onTick: () => Promise<void>;
  onComplete?: () => void;
}
