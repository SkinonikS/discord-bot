import pretty from 'pino-pretty';

export default function (options: Record<string, unknown>): pretty.PrettyStream {
  return pretty({
    ...options,
    messageFormat: (log, messageKey) => {
      const message = log[messageKey];
      const module = log.module ? `[${log.module}]` : '';
      const app = log.app ? `{${log.app}}` : '';

      return `${module}${app} ${message}`;
    },
    ignore: 'module,app,version,pid,hostname',
    errorLikeObjectKeys: options.showStackTrace ? ['err', 'error'] : [],
    errorProps: options.showStackTrace ? '' : 'message',
  });
}
