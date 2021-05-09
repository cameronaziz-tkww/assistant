import { Log, CODE, LogMessage, LogConfig } from '../types';

const heading = (code?: CODE) => {
  switch(code) {
    case CODE.ERROR: return '\x1b[37m\x1b[41m[ERROR]\x1b[0m ';
    case CODE.WARNING: return '\x1b[37m\x1b[43m[WARNING]\x1b[0m ';
    case CODE.INFO: return '\x1b[37m\x1b[46m[INFO]\x1b[0m ';
    default: return '';
  }
};

const write = (message: string, code?: CODE) => {
  const writeBuffer = Buffer.from(`${heading(code)}${message}\n`);
  process.stdout.write(writeBuffer);
};

const configIsConfig = (unknown: LogMessage | LogConfig): unknown is LogConfig =>
  typeof (unknown as LogConfig).message !== 'undefined';

const log: typeof Log = (config: LogConfig | LogMessage, logCode?: CODE) => {
  const message = configIsConfig(config) ? config.message : config;
  const code = configIsConfig(config) ? config.logCode : logCode;
  const nlAfterHeading = configIsConfig(config) ? config.nlAfterHeading : false;

  if (nlAfterHeading && typeof code !== 'undefined') {
    write('', code);
  }

  if (Array.isArray(message)) {
    message.forEach(
      (line, index) => {
        const isFirst = index === 0 && !nlAfterHeading;
        write(
          `${isFirst ? '' : '  '}${line}`,
          isFirst ? code : undefined,
        );
      },
    );
    return;
  }

  write(message);
};

export default log;
