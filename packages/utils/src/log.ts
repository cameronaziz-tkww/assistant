import time from './time';
import { Log } from '.';

const log = (message: string, config: Log.Config) => {
  if (!config.inDevelopment) {
    return;
  }
  if (config.logger) {
    const now = new Date();
    const logMessage = config.noTimestamp ? message : `${message} - ${time.displayDate(now)}`;
    config.logger(logMessage, config.level)
  }
};

export default log;
