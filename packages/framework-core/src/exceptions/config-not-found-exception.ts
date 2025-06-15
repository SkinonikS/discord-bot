import { createError } from '@poppinss/exception';

export const ConfigNotFoundException = createError<[string]>(
  'Configuration for \'%s\' is missing. Maybe you forgot to add it into \'bootstrap/kernel.ts\'?',
  'E_CONFIG_NOT_FOUND',
);

export default ConfigNotFoundException;
