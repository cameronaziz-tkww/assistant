import log from '../log';
import uuid from '../uuid';

declare const chrome: Chrome.Instance;

const respond = <T extends Runtime.Responses>(message: Runtime.MessageWithMeta<T>): void => {
  log.message(message, 'Respond');
  chrome.runtime.sendMessage(message);
};

const send = (message: Utilities.DistributiveOmit<Runtime.Fetcher | Runtime.Setter, 'meta'>): string => {
  const id = uuid();
  chrome.runtime.sendMessage({
    ...message,
    meta: {
      id,
    },
  });
  return id;
};

const listen = <T extends Runtime.Message>(type: T['type'] | T['type'][], listener: Chrome.MessageListener<T>): App.EmptyCallback => {
  const localListener = (message: T) => {
    if (Array.isArray(type) && type.includes(message.type)) {
      listener(message);
      return;
    }
    if (message.type === type) {
      listener(message);
    }
  };

  if (!chrome.runtime.onMessage.hasListener(localListener)) {
    chrome.runtime.onMessage.addListener(localListener);
  }

  const stopListening = () => {
    hangup(listener);
  };

  return stopListening;
};

const hangup = <T extends Runtime.Message>(listener: Chrome.MessageListener<T>): void => {
  if (chrome.runtime.onMessage.hasListener(listener)) {
    chrome.runtime.onMessage.removeListener(listener);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { sendMessage, ...rest } = chrome.runtime;

export default {
  ...rest,
  hangup,
  listen,
  respond,
  send,
};