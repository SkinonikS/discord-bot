import { cleanEnv, str } from 'envalid';

export const Env = cleanEnv(process.env, {
  DISCORD_TOKEN: str(),
});
