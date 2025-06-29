export interface RedisConfig {
  default: string;
  clients: Record<string, RedisClientConfig>;
}

export interface RedisClientConfig {
  secure: boolean;
  host: string;
  port: number;
  database: number;
  username?: string;
  password?: string;
}
