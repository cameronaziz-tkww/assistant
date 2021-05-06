import { github } from '@context';
import { chrome } from '@utils';
import { useState } from 'react';

const { storage: { guards }, runtime: { send, listen } } = chrome;

const useInitSettings: Hooks.UseInitContext = () => {
  const setDraft = github.useSetDraft();
  const [isFetching, setIsFetching] = useState(false);

  const listener = (message: Runtime.StorageOn) => {
    if (!guards.githubSettings(message)) {
      return;
    }

    const { data, meta } = message;

    if (meta.done) {
      setIsFetching(false);
    }

    setDraft(
      (draft) => {
        draft.settings = data;
      });
  };

  const init = () => {
    const hangup =
      listen('STORAGE_ON', listener);
    if (!isFetching) {
      setIsFetching(true);
      send({ type: 'STORAGE_GET', key: 'githubSettings' });
    }
    return hangup;
  };

  return init;
};

export default useInitSettings;
