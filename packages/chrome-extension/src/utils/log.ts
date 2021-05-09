
import format from 'date-fns/format';
import { IS_DEV } from '../settings';
type LogType = 'Receive' | 'Respond';

const logMessage = (message: Runtime.Message, logType: LogType): void => {
  if (!IS_DEV) {
    return;
  }

  const now = format(new Date(), 'HH:mm:ss.SSS');
  const { type, ...rest } = message;
  const color = logType === 'Receive' ? '#54ced9' : '#d954c1';

  console.group(`%c ${logType} ${type} - ${now}`, `color: ${color}`);
  console.log(rest);
  console.groupEnd();
};

const logPayload = (name: string | number | boolean, payload?: App.ShouldDefineType): void => {
  if (!IS_DEV) {
    return;
  }

  const now = format(new Date(), 'HH:mm:ss.SSS');

  console.group(`%c ${name} - ${now}`, 'color: #d9b654');
  if (payload) {
    console.log(payload);
  }
  console.groupEnd();
};

const log = {
  message: logMessage,
  payload: logPayload,
};

export default log;