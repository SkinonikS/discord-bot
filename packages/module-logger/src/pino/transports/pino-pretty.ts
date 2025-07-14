import pretty from 'pino-pretty';

export interface PrettyOptions {
  ignoreTags?: string[];
  showStackTraces?: boolean;
  colorize?: boolean;
  singleLine?: boolean;
  timeFormat?: string;
}

export default function (options: PrettyOptions): pretty.PrettyStream {
  const ignoreKeys = options.ignoreTags ?? [];

  if (options.showStackTraces === false) {
    ignoreKeys.push('err', 'error');
  }

  return pretty({
    errorLikeObjectKeys: ['err', 'error'],
    ignore: ignoreKeys.join(','),
    colorize: options.colorize ?? true,
    singleLine: options.singleLine ?? true,
    translateTime: options.timeFormat ?? 'HH:MM:ss.l',
  });
}
