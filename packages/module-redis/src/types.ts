export interface RedisConfig {
  secure: boolean;
  host: string;
  port: number;
  database: number;
  password?: string;
}
