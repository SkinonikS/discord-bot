import { cleanEnv, str } from 'envalid';

export const Env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production'], default: 'development' } as const),
  DISCORD_TOKEN: str(),
});
