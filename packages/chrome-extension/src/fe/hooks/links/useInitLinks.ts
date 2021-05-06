import { links } from '@context';
import { chrome } from '@utils';
import { useCallback, useState } from 'react';
import { buildStandard } from './utilities';

const { storage: { guards }, runtime: { send, listen } } = chrome;

const useInitLinks: Hooks.UseInitContext = () => {
  const setDraft = links.useSetDraft();
  const [isFetching, setIsFetching] = useState(false);

  const listener = useCallback(
    (message: Runtime.StorageOn) => {
      setDraft((draft) => {
        if (guards.linksStandard(message)) {
          const standard = buildStandard(message.data);
          draft.standard = standard;
          return draft;
        }

        if (guards.linksCustom(message)) {
          const { data: custom } = message;
          draft.custom = custom;
          return draft;
        }

        if (guards.linksOrder(message)) {
          // setStorageOrder(message.data);
          // draft. = message.data;
          return draft;
        }
      });
    },
    [],
  );

  const init = () => {
    const hangup =
      listen('STORAGE_ON', listener);
    if (!isFetching) {
      setIsFetching(true);
      send({ type: 'STORAGE_GET', key: 'linksStandard' });
      send({ type: 'STORAGE_GET', key: 'linksCustom' });
    }
    return hangup;
  };

  return init;
};

export default useInitLinks;
