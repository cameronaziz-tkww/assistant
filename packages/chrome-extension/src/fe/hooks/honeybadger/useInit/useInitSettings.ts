import { honeybadger } from '@context';
import { chrome } from '@utils';
import { useState } from 'react';

const { storage: { guards }, runtime: { send, listen } } = chrome;

const useInitFaults: Hooks.UseInitContext = () => {
  const setDraft = honeybadger.useSetDraft();
  const [isFetching, setIsFetching] = useState(false);

  const listener = (message: Runtime.StorageOn) => {
    if (guards.honeybadgerSettings(message)) {
      if (message.meta.done) {
        setIsFetching(false);
      }

      setDraft((draft) => {
        draft.monitors = message.data.monitors;
      });
    }
  };

  const init = () => {
    const hangup =
      listen('STORAGE_ON', listener);

    if (!isFetching) {
      setIsFetching(true);
      send({ type: 'STORAGE_GET', key: 'honeybadgerSettings' });
    }
    return hangup;
  };

  return init;
};

export default useInitFaults;
