import { bool, cleanEnv, str } from 'envalid';

export const Env = cleanEnv(process.env, {
  LOG_LEVEL: str({ default: 'debug' }),
  LOG_SHOW_STACK_TRACES: bool({ default: true }),
});
