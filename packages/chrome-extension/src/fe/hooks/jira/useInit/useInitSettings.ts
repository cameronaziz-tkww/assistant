import { jira } from '@context';
import { chrome } from '@utils';
import { useRef } from 'react';

const { storage: { guards }, runtime: { send, listen } } = chrome;

const useInitSettings: Hooks.UseInitContext = () => {
  const setDraft = jira.useSetDraft();
  const isFetching = useRef(false);

  const listener = (message: Runtime.StorageOn) => {
    if (!guards.jiraSettings(message)) {
      return;
    }

    const { data, meta } = message;

    if (meta.done) {
      isFetching.current = false;
    }

    setDraft(
      (draft) => {
        draft.settings = data;
      });
  };

  const init = () => {
    const hangup =
      listen('STORAGE_ON', listener);
    if (!isFetching.current) {
      isFetching.current = true;
      send({ type: 'STORAGE_GET', key: 'jiraSettings' });
    }
    return hangup;
  };

  return init;
};

export default useInitSettings;
